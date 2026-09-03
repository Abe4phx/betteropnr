import Foundation
import SwiftUI
import Capacitor
import ClerkKit
import ClerkKitUI

/// Bridge exposing ClerkKit's native auth state, session token, and (as of
/// Stage D) a native sign-in presentation to JavaScript. Configuration
/// happens once in AppDelegate (Clerk.configure); this plugin never calls
/// Clerk.configure() itself. Nothing resolved here is persisted or logged —
/// ClerkKit remains the sole owner of native session persistence.
@objc(ClerkNativeAuthPlugin)
public class ClerkNativeAuthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ClerkNativeAuthPlugin"
    public let jsName = "ClerkNativeAuth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getAuthState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getToken", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "signOut", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isReady", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "presentSignIn", returnType: CAPPluginReturnPromise),
    ]

    @objc func getAuthState(_ call: CAPPluginCall) {
        Task { @MainActor in
            call.resolve(Self.currentAuthState())
        }
    }

    @objc func getToken(_ call: CAPPluginCall) {
        Task { @MainActor in
            call.resolve(await Self.currentToken())
        }
    }

    @objc func signOut(_ call: CAPPluginCall) {
        Task { @MainActor in
            guard Clerk.shared.isLoaded else {
                call.reject("Clerk not loaded")
                return
            }
            do {
                try await Clerk.shared.auth.signOut()
                call.resolve()
            } catch {
                call.reject("Sign out failed")
            }
        }
    }

    /// Readiness check only. Clerk.configure() is called exactly once, in
    /// AppDelegate at launch — this plugin must never duplicate it.
    @objc func isReady(_ call: CAPPluginCall) {
        Task { @MainActor in
            call.resolve(["isLoaded": Clerk.shared.isLoaded])
        }
    }

    /// Presents ClerkKitUI's officially supported `AuthView` (sign-in mode
    /// only) modally over the active Capacitor view controller. Resolves
    /// exactly once, after the sheet is dismissed — whether because
    /// `AuthView` completed sign-in itself (it auto-dismisses on success) or
    /// because the user tapped its built-in close button. Never resolves
    /// with credentials or a token, only the resulting auth state.
    @objc func presentSignIn(_ call: CAPPluginCall) {
        Task { @MainActor in
            guard let presenter = bridge?.viewController else {
                call.resolve(Self.signInResult(status: "failed"))
                return
            }
            guard Clerk.shared.isLoaded else {
                call.resolve(Self.signInResult(status: "failed"))
                return
            }

            let authView = AnyView(AuthView(mode: .signIn).environment(Clerk.shared))
            let hosting = ClerkAuthHostingController(rootView: authView)
            hosting.modalPresentationStyle = .pageSheet

            var didResolve = false
            hosting.onDismiss = {
                guard !didResolve else { return }
                didResolve = true
                let isSignedIn = Clerk.shared.session != nil
                call.resolve(Self.signInResult(status: isSignedIn ? "signedIn" : "cancelled"))
            }

            presenter.present(hosting, animated: true)
        }
    }

    @MainActor
    private static func signInResult(status: String) -> [String: Any] {
        let clerk = Clerk.shared
        return [
            "status": status,
            "isSignedIn": clerk.session != nil,
            "userId": jsonValue(clerk.user?.id),
        ]
    }

    @MainActor
    private static func currentAuthState() -> [String: Any] {
        let clerk = Clerk.shared
        return [
            "isSignedIn": clerk.session != nil,
            "userId": jsonValue(clerk.user?.id),
            "sessionId": jsonValue(clerk.session?.id),
            "isLoaded": clerk.isLoaded,
        ]
    }

    @MainActor
    private static func currentToken() async -> [String: Any] {
        guard Clerk.shared.isLoaded, let session = Clerk.shared.session else {
            return ["token": NSNull(), "expiresAt": NSNull()]
        }
        do {
            guard let jwt = try await session.getToken() else {
                return ["token": NSNull(), "expiresAt": NSNull()]
            }
            return [
                "token": jwt,
                "expiresAt": jsonValue(expirationTimestamp(fromJWT: jwt)),
            ]
        } catch {
            return ["token": NSNull(), "expiresAt": NSNull()]
        }
    }

    private static func jsonValue(_ value: String?) -> Any {
        value ?? NSNull()
    }

    private static func jsonValue(_ value: Double?) -> Any {
        value ?? NSNull()
    }

    /// Reads only the `exp` claim from the JWT's payload segment. ClerkKit's
    /// own JWT decoder (DecodedJWT) is internal to the ClerkKit module and
    /// not part of its public API, so this parses the standard JWT payload
    /// directly instead of depending on anything ClerkKit-internal.
    private static func expirationTimestamp(fromJWT jwt: String) -> Double? {
        let parts = jwt.split(separator: ".")
        guard parts.count == 3 else { return nil }
        var base64 = String(parts[1])
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")
        while base64.count % 4 != 0 { base64 += "=" }
        guard let data = Data(base64Encoded: base64),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let exp = json["exp"] as? Double
        else { return nil }
        return exp
    }
}

/// Hosts ClerkKitUI's `AuthView` for presentation from a UIKit view
/// controller and reports back when the sheet closes, regardless of whether
/// that happened because `AuthView` dismissed itself (sign-in completed) or
/// because the user tapped its own close button. `AuthView` disables
/// interactive (swipe-to-dismiss) dismissal itself, so `viewDidDisappear`
/// firing here always corresponds to one of those two cases.
@MainActor
private final class ClerkAuthHostingController: UIHostingController<AnyView> {
    var onDismiss: (() -> Void)?
    private var didFireDismiss = false

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        guard isBeingDismissed, !didFireDismiss else { return }
        didFireDismiss = true
        onDismiss?()
    }
}
