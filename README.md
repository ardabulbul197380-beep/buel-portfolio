# BUEL Portfolio — V5

Static portfolio / studio website.

## V5 additions
- Global EN/TR language system across the entire site
- Language choice persists between pages with `localStorage`
- Case studies fully switch language, including headings, facts, body copy, preview UI labels and next-project navigation
- BUEL Lab, 404, inquiry forms, command menu, footer, cursor labels and accessibility labels follow the selected language
- Page titles and meta descriptions change with the selected language
- Inquiry email subject/body labels follow the selected language
- EN/TR switch is available on home, Lab, every case study and the 404 page

## Existing features
- BUEL Lab (`lab.html`) for experiments and prototypes
- Project fact strip with verifiable system/product facts
- Availability signal
- Project inquiry modal that prepares a mailto brief (no backend/data storage)
- Internal page transitions
- Case-study scroll progress bar
- Custom cursor states
- Cmd/Ctrl + K quick navigation
- Custom 404 page
- Favicon and social metadata groundwork

## Pages
- `index.html`
- `lab.html`
- `404.html`
- `work/tribun81.html`
- `work/pusula-akademi.html`
- `work/aksaymns.html`

## Contact placeholders
Replace `hello@buel.studio`, Instagram and LinkedIn links before launch.

## Running locally
From this directory:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.
