# TD Logistics Professional Style Guide

## Colors

### Primary Colors
- **primary-red**: `text-[#b23028]` or `bg-[#b23028]` - Brand identity, CTAs, key interactive elements
- **primary-red-hover**: `bg-[#8f2620]` - Hover states for primary buttons
- **primary-red-light**: `bg-[#b23028]/10` - Subtle highlights, hover backgrounds

### Background Colors
- **bg-page**: `bg-white`
- **bg-container-primary**: `bg-white` - Main content containers, cards
- **bg-container-secondary**: `bg-[#FAFAFA]` - Alternate sections, subtle differentiation
- **bg-container-tertiary**: `bg-[#e5e5e5]` - Input fields, disabled states, subtle separators
- **bg-footer**: `bg-[#010101]` - Footer and dark sections

### Text Colors
- **color-text-primary**: `text-[#010101]` - Headlines, body text, primary content
- **color-text-secondary**: `text-[#010101]/70` - Supporting text, descriptions
- **color-text-tertiary**: `text-[#010101]/50` - Captions, metadata, hints
- **color-text-on-dark**: `text-white` - Text on dark backgrounds (footer, primary buttons)
- **color-text-on-dark-secondary**: `text-white/80` - Secondary text on dark backgrounds
- **color-text-link**: `text-[#b23028]` - Links, clickable text

### Functional Colors
- **color-success-default**: `#2E7D32` - Delivery success, completed status
- **color-success-light**: `#E8F5E9` - Success backgrounds, tags
- **color-warning-default**: `#F57C00` - In-transit, pending status
- **color-warning-light**: `#FFF3E0` - Warning backgrounds, tags
- **color-info-default**: `#1976D2` - Information, tracking updates
- **color-info-light**: `#E3F2FD` - Info backgrounds, tags
- **color-error-default**: `#C62828` - Errors, delays, alerts
- **color-error-light**: `#FFEBEE` - Error backgrounds, tags

### Border Colors
- **border-default**: `border-[#e5e5e5]` - Standard borders, dividers
- **border-emphasis**: `border-[#010101]/20` - Emphasized borders, active states
- **border-primary**: `border-[#b23028]` - Primary action borders

## Typography

- **Font Stack**:
  - **font-family-base**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` - For all UI text

- **Font Size & Weight**:
  - **Caption**: `text-xs font-normal` - Metadata, timestamps
  - **Body Small**: `text-sm font-normal` - Compact information, labels
  - **Body Default**: `text-base font-normal` - Standard body text
  - **Body Emphasis**: `text-base font-semibold` - Emphasized content
  - **Subheading**: `text-lg font-semibold` - Card titles, section subheadings
  - **Heading**: `text-2xl font-semibold` - Page section headers
  - **Page Title**: `text-3xl font-bold` - Main page titles
  - **Display**: `text-4xl font-bold` - Hero headlines
  - **Display Large**: `text-5xl font-bold` - Primary hero statements

- **Line Height**: 1.5

## Border Radius

- **None**: 0px - Maintains professional, structured appearance
- **Small**: 4px - Buttons, small tags, input fields
- **Medium**: 8px - Cards, larger interactive elements
- **Large**: 12px - Feature cards, image containers

## Layout & Spacing

- **Spacing Scale**:
  - **Base Unit**: 4px
  - **Tight**: 8px - Closely related elements within components
  - **Compact**: 12px - Component internal spacing
  - **Standard**: 16px - Default spacing between elements
  - **Comfortable**: 24px - Section spacing within modules
  - **Spacious**: 32px - Major section separations
  - **Section**: 48px - Large section gaps
  - **Hero**: 64px - Hero section padding

## Create Boundaries (contrast of surface color, borders, shadows)

Professional and structured design using clear borders and subtle shadows to create hierarchy and emphasize credibility.

### Borders

- **Default**: 1px solid #e5e5e5. Used for cards, inputs, table cells. `border border-[#e5e5e5]`
- **Emphasis**: 1px solid rgba(1,1,1,0.2). Used for focused states, active elements. `border border-[#010101]/20`
- **Primary**: 2px solid #b23028. Used for primary CTAs, key interactive elements. `border-2 border-[#b23028]`

### Dividers

- Horizontal dividers: `border-t border-[#e5e5e5]`
- Vertical dividers: `border-l border-[#e5e5e5]`
- Used to separate content sections, table rows, navigation items

### Shadows & Effects

- **Subtle Shadow**: `shadow-[0_2px_8px_rgba(0,0,0,0.08)]` - Cards, elevated containers
- **Moderate Shadow**: `shadow-[0_4px_16px_rgba(0,0,0,0.12)]` - Dropdowns, modals, important interactive elements
- **Strong Shadow**: `shadow-[0_8px_24px_rgba(0,0,0,0.16)]` - Floating elements, overlays requiring strong emphasis

## Assets

### Image

- For normal `<img>`: `object-cover`
- For `<img>` with:
  - Slight overlay: `object-cover brightness-95`
  - Heavy overlay: `object-cover brightness-75`

### Logo

- To protect copyright, do **NOT** use real product logos as a logo for a new product, individual user, or other company products.
- **Text-based with Icon**:
  - **Text**: "TD LOGISTICS" in bold uppercase letters
  - **Icon**: Use `fa-truck-fast` from FontAwesome Solid positioned to the left of text
  - **Color**: Primary red (#b23028) for icon and text
  - **Example**:
    ```html
    <div class="flex items-center gap-3">
      <i class="fa-solid fa-truck-fast text-2xl text-[#b23028]"></i>
      <span class="text-xl font-bold text-[#b23028] tracking-wide">TD LOGISTICS</span>
    </div>
    ```

### Icon

- Use FontAwesome Solid icons from Iconify for clear, professional appearance.
- Each icon should be centered in a square container matching the icon's size for layout optimization.
- Use Tailwind font size to control icon size.
- Example:
  ```html
  <div class="flex items-center justify-center bg-transparent w-5 h-5">
    <iconify-icon icon="fa-solid:box" class="text-lg"></iconify-icon>
  </div>
  ```

## Basic Layout - Web

- Vertical Layout:
  - body (w-[1440px])
    - Header (Fixed height w-full) <!-- bg: white -->
    - Content Container (w-full flex):
      - Main Content Area (flex-1 overflow-x-hidden)
    - Footer (Fixed height w-full) <!-- bg: #010101 -->

## Page Layout - Web

```html
<body class="w-[1440px] min-h-[900px] font-[-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif] leading-[1.5]">

</body>
```

## Tailwind Component Examples

### Basic

- **Button (Primary)**:
  - Container: `flex items-center justify-center gap-2 px-6 py-3 bg-[#b23028] text-white text-base font-semibold rounded hover:bg-[#8f2620] transition-colors`
    - Icon (optional): `w-5 h-5`
    - Text: Button label

- **Button (Secondary)**:
  - Container: `flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-[#b23028] text-[#b23028] text-base font-semibold rounded hover:bg-[#b23028]/10 transition-colors`
    - Icon (optional): `w-5 h-5`
    - Text: Button label

- **Button (Text)**:
  - Container: `flex items-center gap-2 text-[#b23028] text-base font-semibold hover:text-[#8f2620] transition-colors`
    - Text: Button label
    - Icon (optional): `w-4 h-4`

- **Label/Tag/Badge**:
  - Success: `inline-flex items-center px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] text-sm font-medium rounded`
  - Warning: `inline-flex items-center px-3 py-1 bg-[#FFF3E0] text-[#F57C00] text-sm font-medium rounded`
  - Info: `inline-flex items-center px-3 py-1 bg-[#E3F2FD] text-[#1976D2] text-sm font-medium rounded`
  - Error: `inline-flex items-center px-3 py-1 bg-[#FFEBEE] text-[#C62828] text-sm font-medium rounded`

### Data Entry

- **Input Field**:
  - Container: `w-full px-4 py-3 bg-[#e5e5e5] border border-[#e5e5e5] rounded text-base text-[#010101] focus:outline-none focus:border-[#010101]/20 focus:bg-white transition-colors`

- **Textarea**:
  - Container: `w-full px-4 py-3 bg-[#e5e5e5] border border-[#e5e5e5] rounded text-base text-[#010101] focus:outline-none focus:border-[#010101]/20 focus:bg-white transition-colors resize-none`

- **Checkbox**:
  - Default: `w-5 h-5 bg-[#e5e5e5] border border-[#e5e5e5] rounded`
  - Checked: `w-5 h-5 bg-[#b23028] border border-[#b23028] rounded text-white`

- **Progress Bar**:
  - Container: `w-full h-2 bg-[#e5e5e5] rounded-full overflow-hidden`
  - Fill: `h-full bg-[#b23028]`

### Container

- **Navigation Menu - horizontal**:
  - Nav Container: `flex items-center justify-between w-full px-8 py-4 bg-white border-b border-[#e5e5e5]`
  - Left Section (Logo): `flex items-center`
  - Center Section (Menu): `flex items-center gap-8`
    - Menu Item: `flex items-center gap-2 text-base font-medium text-[#010101] hover:text-[#b23028] transition-colors`
  - Right Section (Actions): `flex items-center gap-4`
    - Button or Icon: As defined in Basic section

- **Card (Service Card)**:
  - Card: `bg-white border border-[#e5e5e5] rounded-lg p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-shadow`
  - Icon Container: `flex items-center justify-center w-12 h-12 bg-[#b23028]/10 rounded mb-4`
    - Icon: `text-2xl text-[#b23028]`
  - Text Area: `flex flex-col gap-2`
    - Title: `text-lg font-semibold text-[#010101]`
    - Description: `text-base text-[#010101]/70`

- **Card (Tracking Card)**:
  - Card: `bg-white border border-[#e5e5e5] rounded-lg p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]`
  - Header: `flex items-center justify-between mb-4 pb-4 border-b border-[#e5e5e5]`
    - Tracking Number: `text-lg font-semibold text-[#010101]`
    - Status Badge: As defined in Label/Tag/Badge section
  - Content: `flex flex-col gap-4`
    - Info Row: `flex items-center gap-3`
      - Icon: `w-5 h-5 text-[#010101]/50`
      - Label: `text-sm text-[#010101]/70`
      - Value: `text-sm font-medium text-[#010101]`

- **Card (Feature Card with Image)**:
  - Card: `bg-white border border-[#e5e5e5] rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-shadow`
  - Image: `w-full h-48 object-cover`
  - Content: `p-6 flex flex-col gap-3`
    - Title: `text-lg font-semibold text-[#010101]`
    - Description: `text-base text-[#010101]/70`
    - CTA: Button as defined in Basic section

- **Footer**:
  - Container: `w-full bg-[#010101] px-8 py-12`
  - Content Grid: `grid grid-cols-4 gap-8`
    - Column: `flex flex-col gap-4`
      - Heading: `text-base font-semibold text-white mb-2`
      - Link: `text-sm text-white/80 hover:text-white transition-colors`
  - Bottom Bar: `flex items-center justify-between pt-8 mt-8 border-t border-white/20`
    - Copyright: `text-sm text-white/80`
    - Social Links: `flex items-center gap-4`

## Additional Notes

- **Authentic Imagery**: All website imagery should feature real TD Logistics assets - actual fleet vehicles, warehouse facilities, and staff members. Avoid generic stock photography to build genuine trust.
- **Dual Audience Clarity**: Design should clearly distinguish B2B (partnership, bulk shipping) and B2C (individual tracking, simple booking) pathways without compromising unified brand identity.
- **RTL Support Consideration**: Given Saudi Arabia market, ensure layout flexibility for potential Arabic (RTL) language implementation.
- **Accessibility**: Maintain WCAG AA contrast ratios. Primary red (#b23028) passes against white backgrounds.
- **Trust Signals**: Prominently display certifications, partnerships, tracking transparency, and customer testimonials throughout the design.
- **Mobile Responsiveness**: While this is a web style guide, ensure all components can adapt to smaller screens for comprehensive accessibility.

<colors_extraction>
#b23028
#8f2620
#b2302819
#FFFFFF
#FAFAFA
#e5e5e5
#010101
#010101B3
#01010180
#FFFFFFCC
#2E7D32
#E8F5E9
#F57C00
#FFF3E0
#1976D2
#E3F2FD
#C62828
#FFEBEE
#01010133
</colors_extraction>
