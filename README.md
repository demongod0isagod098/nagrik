# Nagrik
A project built to fix the massive headache of using Indian government websites

 Right now, sites like CPGRAMS (for complaints) and the Income Tax portal are packed with complicated English text, confusing drop-down menus, and terrifying legal terms. If you are a delivery rider, a farmer, or someone who isn't great with technology, these sites are almost impossible to use

> A hackathon project built to stop Indian government websites from being a total nightmare to use.

We built a clean frontend wrapper that handles all the confusing logic behind the scenes using OpenAI tools.

### 🛠️ The Tech Breakdown

* **The Core UI:** Built out rapidly using `v0 by Vercel` to escape boring government layouts and create something genuinely clean and accessible.(open ai models)
* **The Voice Layer:** Connected to OpenAI's `Whisper API` so users can just talk naturally in Hindi, Hinglish, or Tamil instead of typing formal English summaries.
* **The Brains (`GPT 5.6 terra ` & `GPT 5.6 Luna`):** These models handle the heavy lifting. They take raw voice notes or passbook photos, sort out the data, map it to the right categories, and spit out clean, formatted JSON files for our frontend and making of my website.

### 🛑 What's Real vs. What's Mocked
We don't have access to official backend servers, so we drew a clear line for this hackathon:
* **🟢 Real & Working:** Multi-lingual voice transcription, automatic department tagging based on user complaints, and passbook image parsing.
* **🟡 Mocked / Fabricated:** Aadhaar OTP verification (any 12 digits will bypass the login page), live database lookups, and final database entries to official government portals.
