# Wedding RSVP Website

A beautiful, modern wedding RSVP website that works seamlessly with custom domains. This is a fully responsive, client-side application that collects and manages wedding RSVPs.

## Features

- ✨ Beautiful, elegant design with modern UI/UX
- 📱 Fully responsive (works on all devices)
- 📝 Comprehensive RSVP form with guest information
- 📊 Admin dashboard to view all RSVPs
- 📈 Statistics and analytics
- 🔍 Search and filter functionality
- 📥 Export RSVPs to CSV
- 💾 Local storage for data persistence
- 🌐 Works with any custom domain

## Files Structure

```
WeddingRSVPWebsite/
├── index.html          # Main RSVP form page
├── admin.html          # Admin dashboard
├── styles.css          # Main stylesheet
├── admin.css           # Admin page styles
├── script.js           # RSVP form functionality
├── admin.js            # Admin dashboard functionality
└── README.md           # This file
```

## Customization

### Update Wedding Information

Edit `index.html` to customize:

1. **Couple Names** (line 18):
   ```html
   <h1 class="couple-names">Sarah & John</h1>
   ```

2. **Wedding Date** (line 19):
   ```html
   <p class="wedding-date">June 15, 2024</p>
   ```

3. **Location** (line 20):
   ```html
   <p class="wedding-location">Garden Estate, Napa Valley</p>
   ```

4. **Wedding Details** (lines 102-126):
   - Date and time
   - Location address
   - Dress code
   - Parking information

### Customize Colors

Edit `styles.css` to change the color scheme. The main color variables are defined at the top:

```css
:root {
    --primary-color: #d4a574;      /* Main accent color */
    --secondary-color: #8b6f47;     /* Secondary color */
    --accent-color: #f5e6d3;        /* Background accent */
    /* ... */
}
```

## Deployment with Custom Domain

This website is a static site and can be deployed to any hosting service that supports custom domains. Here are popular options:

### Option 1: GitHub Pages (Free)

1. Create a GitHub repository
2. Upload all files to the repository
3. Go to Settings → Pages
4. Select your branch and folder
5. Add your custom domain in the Custom domain field
6. Update your domain's DNS settings:
   - Add a CNAME record pointing to `yourusername.github.io`
   - Or add A records for GitHub Pages IPs

### Option 2: Netlify (Free)

1. Sign up at [netlify.com](https://netlify.com)
2. Drag and drop your project folder or connect to Git
3. Go to Domain settings
4. Add your custom domain
5. Follow Netlify's DNS configuration instructions

### Option 3: Vercel (Free)

1. Sign up at [vercel.com](https://vercel.com)
2. Import your project
3. Go to Settings → Domains
4. Add your custom domain
5. Update your DNS records as instructed

### Option 4: Traditional Web Hosting

1. Upload all files via FTP to your web hosting provider
2. Ensure `index.html` is in the root directory
3. Configure your domain's DNS to point to your hosting provider

### DNS Configuration

For any hosting service, you'll typically need to:

1. **For a subdomain** (e.g., `rsvp.yourdomain.com`):
   - Add a CNAME record: `rsvp` → `your-hosting-provider.com`

2. **For the root domain** (e.g., `yourdomain.com`):
   - Add A records pointing to your hosting provider's IP addresses
   - Or add a CNAME record (if your provider supports it)

## How It Works

### RSVP Collection

- Guests fill out the RSVP form on `index.html`
- Data is stored in the browser's localStorage
- Each RSVP includes:
  - Guest name and contact information
  - Attendance status (Yes/No/Maybe)
  - Number of guests
  - Dietary restrictions
  - Personal message

### Admin Dashboard

- Access the admin dashboard at `admin.html`
- View all RSVPs with statistics
- Search and filter RSVPs
- Export all data to CSV

### Data Storage

Currently, RSVPs are stored in the browser's localStorage. For production use with multiple devices, consider:

1. **Backend Integration**: Modify `script.js` to send data to your backend API
2. **Database**: Use services like Firebase, Supabase, or your own database
3. **Email Notifications**: Add email functionality to notify you of new RSVPs

## Adding Backend Integration

To store RSVPs on a server instead of localStorage:

1. Set up a backend API endpoint (e.g., `/api/rsvp`)
2. Update the `sendRSVPToServer` function in `script.js`:

```javascript
async function sendRSVPToServer(rsvpData) {
    try {
        const response = await fetch('/api/rsvp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rsvpData)
        });
        if (!response.ok) throw new Error('Failed to save RSVP');
    } catch (error) {
        console.error('Error sending RSVP to server:', error);
    }
}
```

3. Update `admin.js` to fetch RSVPs from your API instead of localStorage

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is open source and available for personal and commercial use.

## Support

For issues or questions, please check the code comments or modify the files as needed for your specific requirements.

---

**Note**: Remember to update all wedding-specific information in `index.html` before deploying!
