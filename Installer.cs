// Installer.cs - Beautiful Native Windows Setup Wizard for Christmas Athletic 3D
using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Windows.Forms;

namespace ChristmasAthletic3DInstaller
{
    public class SetupForm : Form
    {
        private TextBox txtPath;
        private CheckBox chkDesktop;
        private CheckBox chkStartMenu;
        private CheckBox chkLaunchNow;
        private Button btnInstall;
        private ProgressBar progressBar;
        private Label lblStatus;
        private string defaultInstallDir;

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new SetupForm());
        }

        public SetupForm()
        {
            this.Text = "Christmas Athletic 3D - Setup";
            this.Size = new Size(540, 420);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.BackColor = Color.FromArgb(16, 26, 44);
            this.ForeColor = Color.White;

            defaultInstallDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Programs\ChristmasAthletic3D");

            InitializeComponents();
        }

        private void InitializeComponents()
        {
            // Header Banner Panel
            Panel pnlBanner = new Panel();
            pnlBanner.Dock = DockStyle.Top;
            pnlBanner.Height = 80;
            pnlBanner.BackColor = Color.FromArgb(180, 40, 40);

            Label lblTitle = new Label();
            lblTitle.Text = "🎄 Christmas Athletic 3D";
            lblTitle.Font = new Font("Segoe UI", 16, FontStyle.Bold);
            lblTitle.ForeColor = Color.Gold;
            lblTitle.Location = new Point(20, 14);
            lblTitle.AutoSize = true;
            pnlBanner.Controls.Add(lblTitle);

            Label lblSub = new Label();
            lblSub.Text = "Setup Wizard - 1000 Stages Winter Platformer";
            lblSub.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
            lblSub.ForeColor = Color.WhiteSmoke;
            lblSub.Location = new Point(24, 46);
            lblSub.AutoSize = true;
            pnlBanner.Controls.Add(lblSub);

            this.Controls.Add(pnlBanner);

            // Install Path Label
            Label lblPath = new Label();
            lblPath.Text = "インストール先フォルダ:";
            lblPath.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            lblPath.Location = new Point(24, 105);
            lblPath.AutoSize = true;
            this.Controls.Add(lblPath);

            // Path TextBox
            txtPath = new TextBox();
            txtPath.Text = defaultInstallDir;
            txtPath.Location = new Point(26, 130);
            txtPath.Size = new Size(380, 26);
            txtPath.Font = new Font("Segoe UI", 9.5f);
            txtPath.BackColor = Color.FromArgb(24, 38, 60);
            txtPath.ForeColor = Color.White;
            this.Controls.Add(txtPath);

            // Browse Button
            Button btnBrowse = new Button();
            btnBrowse.Text = "参照...";
            btnBrowse.Location = new Point(415, 128);
            btnBrowse.Size = new Size(85, 28);
            btnBrowse.FlatStyle = FlatStyle.Flat;
            btnBrowse.BackColor = Color.FromArgb(40, 60, 90);
            btnBrowse.ForeColor = Color.White;
            btnBrowse.Click += (s, e) =>
            {
                using (FolderBrowserDialog fbd = new FolderBrowserDialog())
                {
                    fbd.SelectedPath = txtPath.Text;
                    if (fbd.ShowDialog() == DialogResult.OK)
                    {
                        txtPath.Text = Path.Combine(fbd.SelectedPath, "ChristmasAthletic3D");
                    }
                }
            };
            this.Controls.Add(btnBrowse);

            // Shortcut Checkboxes
            chkDesktop = new CheckBox();
            chkDesktop.Text = "デスクトップにショートカットを作成する";
            chkDesktop.Checked = true;
            chkDesktop.Location = new Point(28, 175);
            chkDesktop.AutoSize = true;
            chkDesktop.Font = new Font("Segoe UI", 9.5f);
            this.Controls.Add(chkDesktop);

            chkStartMenu = new CheckBox();
            chkStartMenu.Text = "スタートメニューに登録する";
            chkStartMenu.Checked = true;
            chkStartMenu.Location = new Point(28, 205);
            chkStartMenu.AutoSize = true;
            chkStartMenu.Font = new Font("Segoe UI", 9.5f);
            this.Controls.Add(chkStartMenu);

            chkLaunchNow = new CheckBox();
            chkLaunchNow.Text = "インストール完了後にすぐにゲームを起動する";
            chkLaunchNow.Checked = true;
            chkLaunchNow.Location = new Point(28, 235);
            chkLaunchNow.AutoSize = true;
            chkLaunchNow.Font = new Font("Segoe UI", 9.5f);
            this.Controls.Add(chkLaunchNow);

            // Status Label
            lblStatus = new Label();
            lblStatus.Text = "準備完了。「インストール」をクリックしてください。";
            lblStatus.Location = new Point(26, 275);
            lblStatus.Size = new Size(470, 20);
            lblStatus.Font = new Font("Segoe UI", 9f);
            lblStatus.ForeColor = Color.LightSkyBlue;
            this.Controls.Add(lblStatus);

            // Progress Bar
            progressBar = new ProgressBar();
            progressBar.Location = new Point(26, 300);
            progressBar.Size = new Size(474, 18);
            progressBar.Style = ProgressBarStyle.Continuous;
            this.Controls.Add(progressBar);

            // Bottom Buttons Panel
            btnInstall = new Button();
            btnInstall.Text = "🎁 インストール";
            btnInstall.Location = new Point(260, 332);
            btnInstall.Size = new Size(130, 34);
            btnInstall.FlatStyle = FlatStyle.Flat;
            btnInstall.BackColor = Color.FromArgb(190, 40, 40);
            btnInstall.Font = new Font("Segoe UI", 10f, FontStyle.Bold);
            btnInstall.ForeColor = Color.White;
            btnInstall.Click += BtnInstall_Click;
            this.Controls.Add(btnInstall);

            Button btnCancel = new Button();
            btnCancel.Text = "キャンセル";
            btnCancel.Location = new Point(400, 332);
            btnCancel.Size = new Size(100, 34);
            btnCancel.FlatStyle = FlatStyle.Flat;
            btnCancel.BackColor = Color.FromArgb(40, 50, 70);
            btnCancel.ForeColor = Color.White;
            btnCancel.Click += (s, e) => this.Close();
            this.Controls.Add(btnCancel);
        }

        private void BtnInstall_Click(object sender, EventArgs e)
        {
            string targetDir = txtPath.Text.Trim();
            if (string.IsNullOrEmpty(targetDir)) return;

            btnInstall.Enabled = false;
            lblStatus.Text = "ファイルを展開しています...";
            progressBar.Value = 25;
            Application.DoEvents();

            try
            {
                if (!Directory.Exists(targetDir))
                {
                    Directory.CreateDirectory(targetDir);
                }

                // Extract embedded ZIP resource
                Assembly asm = Assembly.GetExecutingAssembly();
                using (Stream resStream = asm.GetManifestResourceStream("package.zip"))
                {
                    if (resStream == null)
                    {
                        throw new Exception("Embedded resource package.zip not found.");
                    }

                    string tempZip = Path.Combine(Path.GetTempPath(), "ChristmasAthletic3D_Setup_" + Guid.NewGuid() + ".zip");
                    using (FileStream fs = new FileStream(tempZip, FileMode.Create, FileAccess.Write))
                    {
                        resStream.CopyTo(fs);
                    }

                    progressBar.Value = 60;
                    Application.DoEvents();

                    // Extract ZIP contents
                    ZipFile.ExtractToDirectory(tempZip, targetDir);
                    File.Delete(tempZip);
                }

                progressBar.Value = 85;
                lblStatus.Text = "ショートカットを作成しています...";
                Application.DoEvents();

                string exePath = Path.Combine(targetDir, "ChristmasAthletic3D.exe");

                // Create Desktop Shortcut
                if (chkDesktop.Checked)
                {
                    string desktopDir = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                    string shortcutPath = Path.Combine(desktopDir, "Christmas Athletic 3D.lnk");
                    CreateShortcut(shortcutPath, exePath, targetDir);
                }

                // Create Start Menu Shortcut
                if (chkStartMenu.Checked)
                {
                    string startMenuDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs");
                    string shortcutPath = Path.Combine(startMenuDir, "Christmas Athletic 3D.lnk");
                    CreateShortcut(shortcutPath, exePath, targetDir);
                }

                progressBar.Value = 100;
                lblStatus.Text = "インストールが正常に完了しました！";
                lblStatus.ForeColor = Color.LightGreen;

                MessageBox.Show("Christmas Athletic 3D のインストールが完了しました！", "インストール成功", MessageBoxButtons.OK, MessageBoxIcon.Information);

                if (chkLaunchNow.Checked && File.Exists(exePath))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = exePath,
                        WorkingDirectory = targetDir
                    });
                }

                this.Close();
            }
            catch (Exception ex)
            {
                MessageBox.Show("インストール中にエラーが発生しました:\n" + ex.Message, "エラー", MessageBoxButtons.OK, MessageBoxIcon.Error);
                btnInstall.Enabled = true;
                lblStatus.Text = "エラーが発生しました。";
                lblStatus.ForeColor = Color.Red;
            }
        }

        private void CreateShortcut(string shortcutPath, string targetPath, string workingDir)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                dynamic shell = Activator.CreateInstance(shellType);
                dynamic shortcut = shell.CreateShortcut(shortcutPath);
                shortcut.TargetPath = targetPath;
                shortcut.WorkingDirectory = workingDir;
                shortcut.Description = "Christmas Athletic 3D - 1000 Stages Winter Platformer";
                shortcut.IconLocation = targetPath + ",0";
                shortcut.Save();
            }
            catch { }
        }
    }
}
