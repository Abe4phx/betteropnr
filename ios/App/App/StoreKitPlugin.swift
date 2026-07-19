import Foundation
import Capacitor
import StoreKit

@objc(StoreKitPlugin)
public class StoreKitPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StoreKitPlugin"
    public let jsName = "StoreKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getSubscriptionStatus", returnType: CAPPluginReturnPromise),
    ]

    @objc func getProducts(_ call: CAPPluginCall) {
        guard let ids = call.getArray("productIds", String.self), !ids.isEmpty else {
            call.reject("productIds required")
            return
        }
        Task {
            do {
                let products = try await Product.products(for: Set(ids))
                let list: [[String: Any]] = products.map { p in
                    ["productId": p.id,
                     "title": p.displayName,
                     "description": p.description,
                     "price": "\(p.price)",
                     "localizedPrice": p.displayPrice]
                }
                call.resolve(["products": list])
            } catch {
                call.reject("getProducts failed: \(error.localizedDescription)")
            }
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("productId required")
            return
        }
        Task {
            do {
                let products = try await Product.products(for: [productId])
                guard let product = products.first else {
                    call.reject("Product not found: \(productId)")
                    return
                }
                let result = try await product.purchase()
                switch result {
                case .success(let verification):
                    switch verification {
                    case .verified(let tx):
                        await tx.finish()
                        call.resolve(transactionPayload(tx, jws: verification.jwsRepresentation))
                    case .unverified(_, let err):
                        call.reject("Unverified: \(err.localizedDescription)")
                    }
                case .userCancelled:
                    call.reject("USER_CANCELLED")
                case .pending:
                    call.reject("PENDING")
                @unknown default:
                    call.reject("Unknown purchase result")
                }
            } catch {
                call.reject("Purchase failed: \(error.localizedDescription)")
            }
        }
    }

    @objc func restorePurchases(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()
                let result = try await activeEntitlements()
                call.resolve(result)
            } catch {
                call.reject("Restore failed: \(error.localizedDescription)")
            }
        }
    }

    @objc func getSubscriptionStatus(_ call: CAPPluginCall) {
        Task {
            do {
                let result = try await activeEntitlements()
                call.resolve(result)
            } catch {
                call.reject("Status check failed: \(error.localizedDescription)")
            }
        }
    }

    // Builds the JS-facing payload for one verified transaction, including
    // the raw Apple-signed JWS so the backend can independently verify it.
    // jwsRepresentation lives on VerificationResult<Transaction> itself, not
    // on the unwrapped Transaction — callers must pass the JWS string from
    // the VerificationResult they matched .verified(tx) against; it cannot
    // be read off `tx` after the fact. Only ever called with an
    // already-verified Transaction — see the .verified case in purchase()
    // and the filter in activeEntitlements() below. Never called with an
    // unverified or revoked transaction.
    private func transactionPayload(_ tx: Transaction, jws: String) -> [String: Any] {
        var payload: [String: Any] = [
            "transactionId": String(tx.id),
            "originalTransactionId": String(tx.originalID),
            "productId": tx.productID,
            "purchaseDate": ISO8601DateFormatter().string(from: tx.purchaseDate),
            "environment": tx.environment.rawValue,
            "signedTransactionInfo": jws,
        ]
        if let expirationDate = tx.expirationDate {
            payload["expirationDate"] = ISO8601DateFormatter().string(from: expirationDate)
        }
        return payload
    }

    // Returns { isSubscribed, productIds } (unchanged shape for existing
    // callers) plus, when at least one entitlement is active, the full
    // details of one representative active transaction (including its
    // signed JWS) under "activeTransaction" so the client can sync it to
    // the backend. Only ever considers verified, non-revoked entitlements —
    // an unverified or revoked transaction is never treated as active and
    // never included in the result.
    private func activeEntitlements() async throws -> [String: Any] {
        var activeIds: [String] = []
        var activeTransaction: Transaction?
        var activeTransactionJws: String?
        for await result in Transaction.currentEntitlements {
            if case .verified(let tx) = result, tx.revocationDate == nil {
                activeIds.append(tx.productID)
                if activeTransaction == nil {
                    activeTransaction = tx
                    activeTransactionJws = result.jwsRepresentation
                }
            }
        }
        var result: [String: Any] = ["isSubscribed": !activeIds.isEmpty, "productIds": activeIds]
        if let tx = activeTransaction, let jws = activeTransactionJws {
            result["activeTransaction"] = transactionPayload(tx, jws: jws)
        }
        return result
    }
}
