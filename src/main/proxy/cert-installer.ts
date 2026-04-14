import { exec } from "child_process";
import { platform } from "os";
import { basename } from "path";

/**
 * CertInstaller — Cross-platform CA certificate installation/removal
 * using elevated privilege execution.
 *
 * Windows: certutil  (UAC prompt via runas)
 * macOS:   security  (password prompt via osascript)
 * Linux:   update-ca-certificates (pkexec/sudo prompt)
 */

interface CertResult {
  success: boolean;
  error?: string;
}

// Dynamically import @vscode/sudo-prompt to avoid bundling issues
async function getSudoPrompt(): Promise<typeof import("@vscode/sudo-prompt")> {
  return await import("@vscode/sudo-prompt");
}

function execPromise(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 30_000 }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve(stdout);
    });
  });
}

function sudoExec(cmd: string, name: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const sudo = await getSudoPrompt();
    sudo.exec(cmd, { name }, (err?: Error, stdout?: string | Buffer) => {
      if (err) reject(err);
      else resolve(String(stdout ?? ""));
    });
  });
}

export class CertInstaller {
  /**
   * Install CA certificate to the system trust store (requires elevation).
   */
  static async install(certPath: string): Promise<CertResult> {
    try {
      const os = platform();

      if (os === "win32") {
        await sudoExec(
          `certutil -addstore Root "${certPath}"`,
          "Anything Analyzer",
        );
      } else if (os === "darwin") {
        await sudoExec(
          `security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "${certPath}"`,
          "Anything Analyzer",
        );
      } else {
        // Linux — copy to ca-certificates dir then update
        const dest = "/usr/local/share/ca-certificates/anything-analyzer.crt";
        await sudoExec(
          `cp "${certPath}" "${dest}" && update-ca-certificates`,
          "Anything Analyzer",
        );
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  /**
   * Remove CA certificate from the system trust store (requires elevation).
   */
  static async uninstall(certPath: string): Promise<CertResult> {
    try {
      const os = platform();

      if (os === "win32") {
        await sudoExec(
          `certutil -delstore Root "Anything Analyzer CA"`,
          "Anything Analyzer",
        );
      } else if (os === "darwin") {
        await sudoExec(
          `security remove-trusted-cert -d "${certPath}"`,
          "Anything Analyzer",
        );
      } else {
        const dest = "/usr/local/share/ca-certificates/anything-analyzer.crt";
        await sudoExec(
          `rm -f "${dest}" && update-ca-certificates`,
          "Anything Analyzer",
        );
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  /**
   * Check whether the CA certificate is currently trusted by the system.
   */
  static async isInstalled(_certPath: string): Promise<boolean> {
    try {
      const os = platform();

      if (os === "win32") {
        const out = await execPromise(
          `certutil -store Root "Anything Analyzer CA"`,
        );
        return out.includes("Anything Analyzer CA");
      } else if (os === "darwin") {
        const out = await execPromise(
          `security find-certificate -c "Anything Analyzer CA" /Library/Keychains/System.keychain`,
        );
        return out.includes("Anything Analyzer CA");
      } else {
        const { existsSync } = await import("fs");
        return existsSync(
          "/usr/local/share/ca-certificates/anything-analyzer.crt",
        );
      }
    } catch {
      return false;
    }
  }
}
