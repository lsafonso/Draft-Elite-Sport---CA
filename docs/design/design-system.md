---

# Draft Elite Sport – Design System (MVP)

This document defines the global **brand identity**, **UI rules**, **colour palette**, **typography**, and **component style guidelines** for the Draft Elite Sport mobile app.  

Cursor must always follow this document for future UI-related work unless explicitly instructed otherwise.

---

## 1. Brand Identity

### 1.1 Theme

Draft Elite Sport uses a **dark, premium, football-inspired theme**, focused on clarity, minimalism and elite performance aesthetics.



The app should feel:

- Clean  

- Professional  

- Modern  

- High-end (similar to elite academies, Nike/Puma style)



No clutter, no unnecessary gradients.

---

## 2. Colour Palette

### 2.1 Primary Colours

| Role | Colour | Hex |

|------|--------|------|

| Primary Gold (accents, CTAs) | Gold | `#D4AF37` |

| Primary Black (background) | Rich Black | `#0A0A0A` |



### 2.2 Secondary Colours

| Role | Hex |

|------|------|

| Dark Grey (cards/surfaces) | `#1A1A1A` |

| Grey (borders) | `#2F2F2F` |

| Light Grey (placeholders/text) | `#8B8B8B` |



### 2.3 Semantic Colours

| Purpose | Colour | Hex |

|--------|--------|------|

| Error | Red | `#FF4C4C` |

| Success | Green | `#27C46A` |

| Warning | Yellow | `#FFCC00` |



---

## 3. Typography

### 3.1 Font Family

- **Inter** (preferred)

- **SF Pro** (iOS)

- Fallback: system fonts



### 3.2 Font Sizes

| Use | Size |

|------|------|

| Headline XL | 28 |

| Headline L | 24 |

| Section Title | 20 |

| Body | 16 |

| Body Small | 14 |

| Caption | 12 |



### 3.3 Weights

- Bold (700)

- Semibold (600)

- Medium (500)

- Regular (400)



---

## 4. Spacing & Layout

### 4.1 Spacing Scale

| Token | Value |

|--------|--------|

| xs | 4px |

| s | 8px |

| m | 12px |

| l | 16px |

| xl | 24px |

| xxl | 32px |



### 4.2 Radius

| Component | Radius |

|----------|---------|

| Buttons | 10–12px |

| Inputs | 8–10px |

| Cards | 12–16px |



---

## 5. Components

### 5.1 Buttons

- Height: **48px**

- Primary button: **Gold (#D4AF37)** with black text  

- Secondary: border `1px solid #2F2F2F`, white text  

- Radius: 12px



### 5.2 Inputs

- Background: `#1A1A1A`

- Border: `#2F2F2F`

- Text: white

- Placeholder: `#8B8B8B`

- Height: 48px

- Radius: 10px



### 5.3 Cards

- Background: `#1A1A1A`

- Padding: 16px

- Radius: 14px



### 5.4 Icons

- Feather/Ionicons

- Size: 20–24px

- Colour: white



---

## 6. Navigation Principles

- Dark mode only (MVP)  

- Bottom tabs for main player areas  

- Stack navigation per role:

  - Player stack

  - Scout stack

  - Admin stack  

- Simple headers, minimal chrome



---

## 7. UX Principles

- Clarity over decoration  

- Big tap targets  

- Large spacing  

- Short forms  

- Consistent alignment  

- Keep things readable, especially for younger players  

- Scouts get more data density but still clean  

- Admin UI prioritises clarity and control



---

## 8. Media

### Profile Photos

- Circular (100px diameter)

- Placeholder for minors



### Highlight Videos

- Embedded YouTube player

- Full width

- Thumbnail inside a 12px-radius card



---

## 9. Safe Areas

Always use `SafeAreaView` for top/bottom.



---

## 10. Theme Mode

MVP is **dark mode only**. Cursor must not generate light mode unless explicitly asked.



---

# End of Document

Cursor must use this file as the global UI/UX reference for the Draft Elite Sport app.

---

