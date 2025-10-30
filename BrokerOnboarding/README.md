# ShelterPoint Producer Onboarding - TurboTax Style Interface

## Overview
This is a modern, user-friendly onboarding interface for ShelterPoint Life Insurance Company producers. The interface guides users through a 6-step process in a TurboTax-style experience with progress indicators, validation, and an intuitive design.

## Files Included
- **index.html** - Landing page and welcome screen
- **step1-personal.html** - Personal information form
- **step2-business.html** - Business details and addresses
- **step3-documents.html** - Document upload interface
- **step4-agreements.html** - Producer Agreement and W-9 form
- **step5-banking.html** - Banking/direct deposit setup (optional)
- **step6-review.html** - Review and submit page
- **confirmation.html** - Success confirmation page
- **styles.css** - Complete styling for all pages

## Features

### User Experience
- ✓ Step-by-step guided process with progress bars
- ✓ Clean, modern TurboTax-inspired design
- ✓ Real-time form validation with helpful error messages
- ✓ Auto-save functionality using localStorage
- ✓ Drag-and-drop file uploads
- ✓ Mobile-responsive design
- ✓ Smart form field toggling based on user selections

### Form Components
1. **Personal Information** - Name, email, phone
2. **Business Information** - License type, Tax ID, addresses
3. **Required Documents** - Insurance license, application/BOR, E&O coverage
4. **Agreements** - Producer Agreement acceptance, W-9 information
5. **Banking** - Optional direct deposit setup
6. **Review** - Comprehensive summary before submission

### Technical Features
- Pure HTML/CSS/JavaScript (no external dependencies)
- localStorage for data persistence
- Client-side validation
- Auto-formatting (phone numbers, ZIP codes)
- Accessible and WCAG-compliant
- Print-friendly review page

## How to Use

### For Development/Testing
1. Open `index.html` in a web browser
2. Fill out the forms step by step
3. Data is automatically saved as you progress
4. You can go back and edit any section before final submission

### For Production Deployment
1. Upload all files to your web server
2. Ensure all files are in the same directory
3. Configure the form submission endpoint in `step6-review.html` (line with `setTimeout`)
4. Update email addresses and phone numbers if needed
5. Add SSL certificate for secure data transmission

## Customization

### Changing Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #003B5C;
    --secondary-color: #0066A1;
    --accent-color: #00A4E4;
    /* etc. */
}
```

### Adding Form Validation
All validation logic is in each step's `<script>` section. Modify as needed for your requirements.

### Backend Integration
Currently uses localStorage for demo purposes. To integrate with a backend:
1. Replace localStorage calls with API calls
2. Update the submission logic in `step6-review.html`
3. Add proper error handling for network requests

## Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Notes
- All sensitive data (SSN, Tax ID) is masked in the review screen
- Implement HTTPS in production
- Add CSRF protection for form submissions
- Validate all data server-side
- Comply with ESIGN Act and UETA for digital signatures

## Accessibility
- Semantic HTML5 structure
- ARIA labels where appropriate
- Keyboard navigation support
- Screen reader friendly
- Color contrast meets WCAG AA standards

## Support Information
As displayed in the interface:
- **Phone:** 800-365-4999
- **Email:** sales@shelterpoint.com
- **Address:** 1225 Franklin Ave. Ste. 475, Garden City, NY 11530

## License
Created for ShelterPoint Life Insurance Company

## Version
1.0 - October 2025
