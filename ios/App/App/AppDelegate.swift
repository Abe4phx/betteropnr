import UIKit
import Capacitor
import ClerkKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        configureClerk()
        return true
    }

    /// Initializes the native ClerkKit client. Must run once at launch, before anything
    /// reads `Clerk.shared`. The publishable key is not a secret (it is already embedded
    /// in the web bundle's VITE_CLERK_PUBLISHABLE_KEY); it is sourced here from the
    /// `ClerkPublishableKey` entry in Info.plist rather than hardcoded in source.
    private func configureClerk() {
        #if DEBUG
        print("[Clerk] Initialization started")
        #endif

        guard let publishableKey = Bundle.main.object(forInfoDictionaryKey: "ClerkPublishableKey") as? String,
              !publishableKey.isEmpty else {
            #if DEBUG
            print("[Clerk] Initialization failed: missing ClerkPublishableKey in Info.plist")
            #endif
            return
        }

        #if DEBUG
        let options = Clerk.Options(
            loggerHandler: { entry in
                print("[Clerk] \(entry.formattedMessage)")
            }
        )
        let clerk = Clerk.configure(publishableKey: publishableKey, options: options)

        let didConfigure = clerk.publishableKey == publishableKey
        let sessionRestored = clerk.session != nil
        print("[Clerk] Initialization \(didConfigure ? "completed" : "failed")")
        print("[Clerk] Existing native session restored: \(sessionRestored)")
        #else
        Clerk.configure(publishableKey: publishableKey)
        #endif
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
