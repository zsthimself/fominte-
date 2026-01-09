# Indexing Strategy (Shadow Directory)

Since pSEO pages are created as "orphan pages" (not assigned to categories or menus) to avoid cluttering the main website navigation, a specific strategy is required to ensure they are discovered and indexed by Google.

## The Strategy

1.  **Generate HTML Sitemap**: Create a single HTML page containing links to all generated pSEO pages.
2.  **Create Shadow Page**: Publish this HTML as a "Directory" page on Shopline.
3.  **Hide from Menu**: Do NOT add this directory page to the website's navigation menu.
4.  **Submit to Google**: Manually submit the URL of this directory page to Google Search Console.

## Workflow

### 1. Generate Sitemap HTML

Run the generator script:

```bash
cd scripts/pseo-content-generator
node generate-html-sitemap.js
```

This will output HTML code to the console or a file (e.g., `sitemap.html`). The HTML consists of a simple list of links:

```html
<div class="pseo-directory">
  <h2>Evening Gown Fabrics</h2>
  <ul>
    <li><a href="/products/evening-gown-sequin-fabric">Evening Gown Sequin Fabric</a></li>
    <li><a href="/products/evening-gown-lace-fabric">Evening Gown Lace Fabric</a></li>
    ...
  </ul>
</div>
```

### 2. Create Directory Page

1.  Log in to Shopline Admin.
2.  Go to **Online Store** > **Pages**.
3.  Click **Add Page**.
4.  Title: "Wholesale Fabric Directory" (or similar).
5.  Content: Switch to **HTML View** (`<>` button) and paste the generated HTML.
6.  **Save**.

### 3. Submit to Google Search Console

1.  Copy the URL of the newly created page (e.g., `https://yourstore.com/pages/wholesale-fabric-directory`).
2.  Go to [Google Search Console](https://search.google.com/search-console).
3.  Paste the URL into the top search bar ("Inspect any URL").
4.  Click **Request Indexing**.

Google will crawl this page and follow all the links, thereby discovering and indexing your pSEO pages.
