// StandaloneLauncher.cs - Single-file Portable Windows App for Christmas Athletic 3D
using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Reflection;
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
                // App runtime directory in Local Temp
                string tempDir = Path.Combine(Path.GetTempPath(), "ChristmasAthletic3D_v700");
                string indexPath = Path.Combine(tempDir, "index.html");

                // If not extracted yet, extract embedded game package
                if (!File.Exists(indexPath))
                {
                    if (Directory.Exists(tempDir))
                    {
                        try { Directory.Delete(tempDir, true); } catch { }
                    }
                    Directory.CreateDirectory(tempDir);

                    Assembly asm = Assembly.GetExecutingAssembly();
                    using (Stream resStream = asm.GetManifestResourceStream("game.zip"))
                    {
                        if (resStream == null)
                        {
                            MessageBox.Show("内蔵ゲームリソースが見つかりません。", "エラー", MessageBoxButtons.OK, MessageBoxIcon.Error);
                            return;
                        }

                        string tempZip = Path.Combine(Path.GetTempPath(), "ChristmasAthletic3D_Extract_" + Guid.NewGuid() + ".zip");
                        using (FileStream fs = new FileStream(tempZip, FileMode.Create, FileAccess.Write))
                        {
                            resStream.CopyTo(fs);
                        }

                        ZipFile.ExtractToDirectory(tempZip, tempDir);
                        try { File.Delete(tempZip); } catch { }
                    }
                }

                if (!File.Exists(indexPath))
                {
                    MessageBox.Show("ゲームファイルの展開に失敗しました。", "エラー", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                // Launch directly as native app window via Edge or Chrome
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

                // Fallback to default browser if app mode fails
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
