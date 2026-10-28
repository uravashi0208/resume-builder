# Shared UI Components

## Folder Structure
```
src/app/shared/
├── shared.module.ts          ← Import this in AppModule
├── index.ts                  ← Barrel exports
└── components/
    ├── input-field/          ← <app-input-field>
    ├── textarea-field/       ← <app-textarea-field>
    ├── checkbox-field/       ← <app-checkbox-field>
    ├── radio-group/          ← <app-radio-group>
    ├── select-field/         ← <app-select-field>
    ├── date-picker/          ← <app-date-picker>
    └── year-picker/          ← <app-year-picker>
```

## Setup
`app.module.ts` ma `SharedModule` import karo — ek vaar karva thi badha components available thai jay:
```ts
import { SharedModule } from './shared/shared.module';

@NgModule({
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, SharedModule],
})
export class AppModule {}
```

---

## Component Usage Examples

### `<app-input-field>`
```html
<app-input-field
  label="Full Name"
  placeholder="Enter name"
  type="text"           <!-- text | email | password | number | tel | url -->
  [required]="true"
  hint="Your legal name"
  [control]="form.get('fullName')"   <!-- for error display -->
  formControlName="fullName">
</app-input-field>
```

### `<app-textarea-field>`
```html
<app-textarea-field
  label="About Me"
  [rows]="4"
  [maxLength]="500"
  [showToolbar]="true"   <!-- shows Bold/Italic/Underline/Bullet toolbar -->
  formControlName="aboutMe">
</app-textarea-field>
```

### `<app-checkbox-field>`
```html
<app-checkbox-field
  label="Present"
  description="I currently work here"
  formControlName="present">
</app-checkbox-field>
```

### `<app-radio-group>`
```html
<app-radio-group
  label="Template"
  layout="horizontal"   <!-- vertical (default) | horizontal -->
  [options]="[
    { value: 'template-one', label: 'Classic' },
    { value: 'template-two', label: 'Modern' },
    { value: 'template-three', label: 'Elegant' }
  ]"
  formControlName="template">
</app-radio-group>
```

### `<app-select-field>`
```html
<app-select-field
  label="Status"
  placeholder="-- Select Status --"
  [options]="[
    { value: 'Applied',   label: 'Applied' },
    { value: 'Accepted',  label: 'Accepted' },
    { value: 'Rejected',  label: 'Rejected' }
  ]"
  formControlName="status">
</app-select-field>
```

### `<app-date-picker>`
```html
<!-- Simple date -->
<app-date-picker
  label="Start Date"
  formControlName="startDate">
</app-date-picker>

<!-- End date with "Present" toggle -->
<app-date-picker
  label="End Date"
  [allowPresent]="true"
  formControlName="endDate">
</app-date-picker>
```

### `<app-year-picker>`
```html
<!-- Used in Education section — year-only grid -->
<app-year-picker
  label="Start Year"
  [startYear]="1990"
  [endYear]="2030"
  [allowPresent]="true"
  formControlName="startDate">
</app-year-picker>
```

---

## All Components Support
- `formControlName` (Reactive Forms)
- `[control]="form.get('field')"` for error display
- `[required]="true"` — shows `*` on label
- `[disabled]="true"` — disables the input
- `[errorMessage]="'Custom error'"` — override default error text
- Auto error display on `touched + invalid`

---

## Design-system rules (read before writing CSS)

All look-and-feel lives in `src/styles.css` (tokens + shared classes) and `src/auth.css` (login/register layout).
Component CSS files should only hold layout that is unique to that component.

| Need | Use |
|---|---|
| Colours, radius, font-size, shadow | tokens: `var(--brand)`, `--text-muted`, `--border`, `--r-md`, `--fs-sm` … **never a hex value** |
| flex / grid / gap / alignment | utilities: `d-flex align-center justify-between gap-3 flex-column flex-wrap flex-1 d-grid grid-2` |
| Frosted surface | `glass` (+ `glass-pill` / `card-round`) |
| Buttons | `btn-primary` `btn-secondary` `btn-danger` `btn-ghost` `btn-add` `btn-icon` (+ `btn-sm`, `btn-block`) |
| Tabs / side nav | `tabs` (children get `.active`), `nav-item` |
| Form control | `field` `field-label` `field-input|textarea|select` `is-invalid` `field-hint` `field-error` |
| Check / radio / switch | `check` + `check-box` (`round`, `sm`), `switch` |
| Option buttons (Customize) | `opt` + `opt-tile` / `opt-sq` / `opt-sm`, group them with `opt-group` |
| Page shell | `page` (width via `style="--page-w:1100px"`), `page-head`, `page-title`, `panel-title`, `card-title` |
| Status / messages | `badge applied|accepted|rejected`, `msg-error`, `msg-success` |
