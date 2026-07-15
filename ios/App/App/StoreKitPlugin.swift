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
                        call.resolve([
                            "transactionId": String(tx.id),
                            "productId": tx.productID,
                            "purchaseDate": ISO8601DateFormatter().string(from: tx.purchaseDate),
                        ])
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

    private func activeEntitlements() async throws -> [String: Any] {
        var activeIds: [String] = []
        for await result in Transaction.currentEntitlements {
            if case .verified(let tx) = result, tx.revocationDate == nil {
                activeIds.append(tx.productID)
            }
        }
        return ["isSubscribed": !activeIds.isEmpty, "productIds": activeIds]
    }
}
