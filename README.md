# Meet the Dukes

A JMU-inspired virtual student organization fair for the CIS 454 proof-of-concept demo. Meet the Dukes is an independent academic project. Sample clubs, recruitment dates, contacts, and events are labeled. The campus-life images depict fictional scenes.

## Open the demo

Open `index.html` in Chrome or Edge. The site uses HTML, CSS, and vanilla JavaScript and runs without installing anything. Keep the `css/`, `js/`, and `assets/` folders next to the HTML file.

The external UREC YouTube video needs an internet connection. If the embedded player is blocked when opening the HTML from disk, use **Watch on YouTube** or open the site over HTTPS. The browser stores favorites, profile edits, event edits, and review flags locally.

## Walk through the three roles

1. **Student** — Choose an interest on Home, search for “coding,” and open **Campus Technology Collective**. Review its sample membership requirements, commitment, leadership contact, recruitment schedule, and deadline. Favorite the club and its Open Build Night, then open **Favorites** to see both reminders. For a video and a real external registration resource, filter for **Intramural Sports**, then open **Intramural Volleyball Preview**.
2. **Organization leader** — Open **Demo Workspace**. Select an existing profile or create a sample organization. Enter profile, recruitment, contact, and video details. After saving a profile, use **Open events** to add or update an event. The student-facing profile displays the edits immediately. Dates entered in the workspace are Eastern.
3. **Administrator** — Open **Demo Workspace → Admin review**. Review a profile, flag outdated information with a note, and open the student-facing profile to see it. Return to Admin review to clear the flag.

The leader and administrator views simulate roles in one browser and have no sign-in. Calendar reminder files include a one-day alert. Import the file and confirm the alert in your calendar app, which handles notification delivery. Automatic email and push reminders, a shared database, and account permissions are outside this proof of concept.

## Maintain the project

- `index.html` contains navigation and the shared page shell. `css/styles.css` defines the JMU-inspired color palette and reusable layouts.
- `js/data.js` contains the sample organizations and events. Keep record IDs stable and connect events using `organizationId`. Set `startsAt` and `deadlineAt` as ISO 8601 values with an explicit Eastern offset, such as `2027-02-22T17:00:00-05:00`. Daylight time uses `-04:00`. Demo dates are fixed and will age out.
- `js/app.js` renders the directory, organization profiles, and events. `js/demo.js` handles browser storage and `js/workflows.js` implements favorites, calendar export, leader editing, and admin review.
- To add a video, supply an approved embeddable YouTube ID and verified captions or a transcript. Profiles without a video show a placeholder. [JMU UREC video reference](https://www.jmu.edu/recreation/visit/guide.shtml)
- Verify links, contact details, and dates before replacing demo entries. For authorized imagery, use a relative path under `assets/images/` and add `imageAlt` when the image adds information. [Design notes](docs/DESIGN.md)
- To start a clean presentation without affecting existing demo edits, use a new browser profile or a private browsing window that permits local storage.

## Publish through GitHub Pages

1. Add the project files to the root of the project's `main` branch and push to GitHub.
2. In **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/(root)**, and save.
3. Open the published URL and verify the directory and a profile deep link. Files use relative paths and navigation uses hash links.

[GitHub Pages publishing instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
