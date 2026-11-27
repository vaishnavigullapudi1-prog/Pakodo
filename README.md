# PAKODO Demand Companion

# Build PAKODO — Voice-First Customer Demand Companion

Create a functional, mobile-first web app called **PAKODO** for micro and small retailers in India.

**Tagline:** Catch the demand. Grow the business.

## Purpose
Small retailers often receive requests for products that are currently unavailable. These requests may be forgotten or difficult to track. PAKODO helps shopkeepers record customer requests, identify repeated demand, and make better-informed stocking decisions.

The app must be simple for shopkeepers with limited digital experience.

## Core user journey
**Speak → Confirm → Save → View History → See Demand Insights**

Prioritize making this complete flow functional.

## 1. Dashboard
Create a welcoming home screen with:
- PAKODO name and tagline
- Large, prominent microphone button
- Shopkeeper and shop name from the profile, if entered
- Total requests recorded
- Simple demand summary cards
- Navigation to Dashboard, History, Insights, Profile and Settings

Use a clean, modern, warm and professional design. Make it mobile-first, responsive and easy to use, with large buttons and readable text.

## 2. Voice Request Capture
Allow the shopkeeper to speak naturally, for example:

“A customer asked for millet flour, but it is not available.”

- Use browser speech recognition where supported.
- Initially support English, Hindi and Telugu where available.
- Show a clear listening indicator.
- Display the recognized text for review.
- Extract the product name and optional customer details where possible.
- Allow manual text entry if speech recognition is unavailable.
- Let the shopkeeper edit the recognized text before saving.
- Do not record continuously in the background.

## 3. Confirmation and Saving
Before saving, show:
- Product name (required)
- Customer name (optional)
- Quantity (optional)
- Additional details (optional)

Provide **Confirm and Save**, **Edit**, and **Cancel** buttons.

Never save an incomplete or unconfirmed request. Show a success message after saving.

## 4. Request History
Create a history screen that:
- Displays saved requests with product name and date
- Allows searching and filtering by product
- Allows editing and deleting individual requests
- Shows a simple status such as Pending or Stocked, if feasible

Save requests in browser storage so they remain after refreshing the page.

## 5. Demand Insights
Calculate and display:
- Total requests
- Most frequently requested unavailable products
- Products with repeated demand
- Simple daily or weekly summaries

Use simple cards, lists or charts. Insights must be based on saved records. Clearly label sample data.

Do not claim to predict sales or guarantee profitability.

## 6. Profile
Create a simple editable Profile screen with:
- Shopkeeper name
- Shop name
- Shop category (grocery, provision store, general store, etc.)
- City or area (optional)
- Preferred language

Do not require login, phone number, email or password for this prototype.

Save profile details locally and use them to personalize the dashboard.

## 7. Settings
Create a simple Settings screen with:

**Appearance**
- Light theme
- Dark theme
- Save and apply the selected theme throughout the app.

**Language**
- Preferred language selection
- Clearly indicate if speech recognition does not support the selected language.

**Notifications**
- Optional reminder setting with an on/off control.
- Ask permission before sending browser notifications.
- If notifications are not supported, explain this.

**Data Management**
- Allow editing and deleting records.
- Include an option to clear all saved requests.
- Ask for confirmation before clearing data.

**Privacy**
Explain that customer names are optional, the microphone is active only during recording, and prototype data is stored locally in the browser.

## 8. Error Handling
- If microphone permission is denied, explain and offer manual entry.
- If speech is unclear, ask the user to repeat or edit.
- If speech recognition is unsupported, keep manual entry fully functional.
- Never silently save a misheard request.
- If saving fails, show an error and allow retry.

## 9. Technical and Prototype Requirements
- Build a genuinely interactive working prototype, not just a static mockup.
- Use local browser storage for requests and profile details.
- Make the core app work without paid APIs or secret keys.
- Clearly identify any simulated or demo-only features.
- Do not build billing, supplier ordering, automatic purchasing, complex forecasting or complicated authentication.
- Keep the project organized and suitable for later GitHub export and Docker setup.

## Final instruction
Build the complete PAKODO prototype with a polished interface and functional core features.

Prioritize the voice request flow, confirmation, saving, history and demand insights. Then implement Profile and Settings.

After building, show me the preview and explain which features are functional and which are simulated. Do not claim a feature works unless it has been implemented.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4cd3a7ae-d912-415c-a8d9-e5f28824258b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
