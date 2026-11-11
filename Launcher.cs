// Launcher.cs - Robust Native Windows Launcher for Christmas Athletic 3D
using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace ChristmasAthletic3D
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                string appDir = AppDomain.CurrentDomain.BaseDirectory;
                string indexPath = Path.Combine(appDir, "index.html");

                if (!File.Exists(indexPath))
                {
                    indexPath = Path.Combine(Directory.GetCurrentDirectory(), "index.html");
                }

                if (!File.Exists(indexPath))
                {
                    MessageBox.Show("index.html が見つかりませんでした。\n" + indexPath, "Christmas Athletic 3D", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                // Try to launch as an App Window via Microsoft Edge or Chrome
                string browserPath = FindBrowser();
                bool launched = false;

                if (!string.IsNullOrEmpty(browserPath))
                {
                    try
                    {
                        ProcessStartInfo psi = new ProcessStartInfo();
                        psi.FileName = browserPath;
                        psi.Arguments = string.Format("--app=\"{0}\" --window-size=1280,780", indexPath);
                        psi.UseShellExecute = false;
                        Process proc = Process.Start(psi);
                        if (proc != null)
                        {
                            launched = true;
                        }
                    }
                    catch { }
                }

                // Fallback: Open with system default browser if App Mode fails
                if (!launched)
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = indexPath,
                        UseShellExecute = true
                    });
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("起動エラー:\n" + ex.Message, "Christmas Athletic 3D", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private static string FindBrowser()
        {
            string[] candidatePaths = new string[]
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe")
            };

            foreach (string p in candidatePaths)
            {
                if (File.Exists(p)) return p;
            }
            return null;
        }
    }
}
