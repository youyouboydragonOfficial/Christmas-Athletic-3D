// Launcher.cs - Native Windows Launcher for Christmas Athletic 3D
using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Windows.Forms;

namespace ChristmasAthletic3D
{
    static class Program
    {
        private static HttpListener listener;
        private static Thread serverThread;
        private static bool isRunning = true;
        private static int port = 38241;
        private static string appDir;

        [STAThread]
        static void Main(string[] args)
        {
            appDir = AppDomain.CurrentDomain.BaseDirectory;
            if (!File.Exists(Path.Combine(appDir, "index.html")))
            {
                // Fallback check current directory
                appDir = Directory.GetCurrentDirectory();
            }

            StartLocalServer();

            // Locate Microsoft Edge or Chrome
            string browserPath = FindBrowser();
            if (string.IsNullOrEmpty(browserPath))
            {
                MessageBox.Show("Microsoft Edge or Google Chrome is required to run Christmas Athletic 3D.", "Christmas Athletic 3D", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            string userDataDir = Path.Combine(Path.GetTempPath(), "ChristmasAthletic3D_UserData");
            string appUrl = string.Format("http://127.0.0.1:{0}/index.html", port);
            string arguments = string.Format("--app=\"{0}\" --window-size=1280,780 --user-data-dir=\"{1}\" --enable-gpu-rasterization --no-first-run", appUrl, userDataDir);

            try
            {
                Process proc = new Process();
                proc.StartInfo.FileName = browserPath;
                proc.StartInfo.Arguments = arguments;
                proc.StartInfo.UseShellExecute = false;
                proc.Start();

                // Wait for browser window to exit
                proc.WaitForExit();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Failed to launch game: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                StopLocalServer();
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

        private static void StartLocalServer()
        {
            try
            {
                listener = new HttpListener();
                listener.Prefixes.Add(string.Format("http://127.0.0.1:{0}/", port));
                listener.Start();

                serverThread = new Thread(ServerLoop);
                serverThread.IsBackground = true;
                serverThread.Start();
            }
            catch (Exception ex)
            {
                // Port might be in use, try alternate
                port = 38245;
                listener = new HttpListener();
                listener.Prefixes.Add(string.Format("http://127.0.0.1:{0}/", port));
                listener.Start();

                serverThread = new Thread(ServerLoop);
                serverThread.IsBackground = true;
                serverThread.Start();
            }
        }

        private static void StopLocalServer()
        {
            isRunning = false;
            try
            {
                if (listener != null && listener.IsListening)
                {
                    listener.Stop();
                    listener.Close();
                }
            }
            catch { }
        }

        private static void ServerLoop()
        {
            while (isRunning && listener.IsListening)
            {
                try
                {
                    HttpListenerContext context = listener.GetContext();
                    ThreadPool.QueueUserWorkItem((c) => HandleRequest((HttpListenerContext)c), context);
                }
                catch
                {
                    if (!isRunning) break;
                }
            }
        }

        private static void HandleRequest(HttpListenerContext context)
        {
            try
            {
                string rawUrl = context.Request.Url.AbsolutePath;
                if (rawUrl == "/" || string.IsNullOrEmpty(rawUrl))
                {
                    rawUrl = "/index.html";
                }

                // Security check against directory traversal
                string relPath = rawUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                string filePath = Path.Combine(appDir, relPath);

                if (!File.Exists(filePath))
                {
                    context.Response.StatusCode = 404;
                    byte[] notFound = Encoding.UTF8.GetBytes("File Not Found");
                    context.Response.OutputStream.Write(notFound, 0, notFound.Length);
                    context.Response.OutputStream.Close();
                    return;
                }

                string ext = Path.GetExtension(filePath).ToLower();
                string mimeType = "application/octet-stream";
                switch (ext)
                {
                    case ".html": mimeType = "text/html; charset=utf-8"; break;
                    case ".js": mimeType = "application/javascript; charset=utf-8"; break;
                    case ".css": mimeType = "text/css; charset=utf-8"; break;
                    case ".mp3": mimeType = "audio/mpeg"; break;
                    case ".ogg": mimeType = "audio/ogg"; break;
                    case ".png": mimeType = "image/png"; break;
                    case ".jpg":
                    case ".jpeg": mimeType = "image/jpeg"; break;
                    case ".ico": mimeType = "image/x-icon"; break;
                    case ".json": mimeType = "application/json"; break;
                }

                context.Response.ContentType = mimeType;
                context.Response.AddHeader("Access-Control-Allow-Origin", "*");
                context.Response.AddHeader("Accept-Ranges", "bytes");

                using (FileStream fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read))
                {
                    context.Response.ContentLength64 = fs.Length;
                    byte[] buffer = new byte[64 * 1024];
                    int read;
                    while ((read = fs.Read(buffer, 0, buffer.Length)) > 0)
                    {
                        context.Response.OutputStream.Write(buffer, 0, read);
                    }
                }
                context.Response.OutputStream.Close();
            }
            catch { }
        }
    }
}
