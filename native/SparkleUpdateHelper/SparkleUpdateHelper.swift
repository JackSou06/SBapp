import Cocoa
import Sparkle

final class SparkleUpdateHelper: NSObject, NSApplicationDelegate, SPUUpdaterDelegate, SPUStandardUserDriverDelegate {
    private var updater: SPUUpdater?
    private var userDriver: SPUStandardUserDriver?

    func applicationDidFinishLaunching(_ notification: Notification) {
        guard CommandLine.arguments.count == 2 else {
            showErrorAndQuit("Missing app executable path.")
            return
        }

        let executableURL = URL(fileURLWithPath: CommandLine.arguments[1])

        guard let appBundleURL = findAppBundleURL(fromExecutableURL: executableURL),
              let appBundle = Bundle(url: appBundleURL) else {
            showErrorAndQuit("Could not locate the host app bundle.")
            return
        }

        let driver = SPUStandardUserDriver(hostBundle: appBundle, delegate: self)
        let sparkleUpdater = SPUUpdater(
            hostBundle: appBundle,
            applicationBundle: appBundle,
            userDriver: driver,
            delegate: self
        )

        do {
            try sparkleUpdater.start()
        } catch {
            showErrorAndQuit("Sparkle could not start: \(error.localizedDescription)")
            return
        }

        userDriver = driver
        updater = sparkleUpdater
        sparkleUpdater.checkForUpdates()
    }

    func standardUserDriverWillFinishUpdateSession() {
        terminateSoon()
    }

    func updater(_ updater: SPUUpdater, didFinishUpdateCycleFor updateCheck: SPUUpdateCheck, error: Error?) {
        if error != nil {
            terminateSoon()
        }
    }

    func updater(_ updater: SPUUpdater, didAbortWithError error: Error) {
        terminateSoon()
    }

    private func findAppBundleURL(fromExecutableURL executableURL: URL) -> URL? {
        var currentURL = executableURL

        while currentURL.path != "/" {
            if currentURL.pathExtension == "app" {
                return currentURL
            }

            currentURL.deleteLastPathComponent()
        }

        return nil
    }

    private func terminateSoon() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            NSApp.terminate(nil)
        }
    }

    private func showErrorAndQuit(_ message: String) {
        let alert = NSAlert()
        alert.messageText = "Check for Updates"
        alert.informativeText = message
        alert.alertStyle = .warning
        alert.runModal()
        NSApp.terminate(nil)
    }
}

@main
enum SparkleUpdateHelperMain {
    static func main() {
        let app = NSApplication.shared
        let delegate = SparkleUpdateHelper()

        app.setActivationPolicy(.accessory)
        app.delegate = delegate
        app.activate(ignoringOtherApps: true)
        app.run()
    }
}
