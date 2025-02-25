# ![icon](src/icons/icon48_inverted.png) ReportPhishing

**ReportPhishing** is a Thunderbird MailExtension that makes it easy to report phishing emails. With a simple click, you can submit a copy of a suspicious email to multiple phishing report services, such as:

- **[APWG](https://apwg.org/)** – `reportphishing@apwg.org`
- **[Netcraft](https://www.netcraft.com/)** – `scam@netcraft.com`
- **[FDA](https://www.fda.gov/)** – `webcomplaints@ora.fda.gov`

Simply click the button, select the services, and submit the report!

## 🚀 Download

You can download the latest version of **ReportPhishing** from the [Releases](https://github.com/LucBennett/ReportPhishing/releases/latest) page.

## 🛠️ Build Instructions

To build the extension from source, follow these steps:

1. **Navigate to the project directory**  
   Open your terminal or command prompt and go to the project folder.

2. **Run the appropriate compile script** based on your operating system:

   - **Node.js**:

     ```bash
     node compile.js
     ```

     (Requires **Node.js**)

   - **Unix & macOS**:

     ```bash
     ./compile.sh
     ```

     (Requires **`/bin/sh`** and **7z** or **zip** installed)

   - **Windows (with .NET)**:

     ```powershell
     ./compile.ps1
     ```

     (Requires **PowerShell** and **.NET**)

   - **Windows (with 7z/zip)**:
     ```powershell
     ./compile-z.ps1
     ```
     (Requires **PowerShell** and **7z** or **zip** installed)

   Alternatively, you can compile using:

   ```bash
   npm run compile
   ```

   The compiled `.xpi` file will be located in the `build` directory.

## 📥 Installation Instructions

To install **ReportPhishing** in Thunderbird:

1. Open **Thunderbird**.
2. Navigate to **Menu** (hamburger icon) → **Add-ons and Themes**.
3. Click **Tools for Add-ons** (gear icon) → **Install Add-on From File**.
4. Select the `ReportPhishing.xpi` file and install it.

## 🔧 Development Workflow

To maintain a clean and efficient codebase, use the following tools:

### 🖋️ Prettier (Code Formatter)

Format the code:

```bash
npm run format
```

### 🕵️ ESLint (Code Linter)

Check for code issues:

```bash
npm run lint
```

### ⚙️ Compiling

To compile the extension:

```bash
npm run compile
```

## 🧪 Running Tests

**ReportPhishing** includes automated tests to ensure proper functionality.

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run the test suite**:

   ```bash
   npm run test
   ```

Regularly running tests helps catch and fix any issues before releasing updates.

## ❤️ Support This Project

If you find **ReportPhishing** useful, consider supporting development:

[![Buy me a coffee!](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://paypal.me/LucBenn)

## 📜 License

**ReportPhishing** is licensed under the **Mozilla Public License 2.0 (MPL-2.0)**.  
See the [LICENSE](LICENSE) file for details.

## 🎨 Icon Credits

The icon was created by [freepik](https://www.freepik.com) and is available on [FlatIcon](https://www.flaticon.com/free-icon/phishing_3067762).
