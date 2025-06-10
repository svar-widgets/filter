## 2.1.1

### Fixes

-   Default "contains" operator for FilterBuilder text values

## 2.1.0

Public release

### Initial features

-   FilterBuilder widget:
    -   three presentation modes: "list", "line", "simple"
    -   ability to create complex filtering rules for multiple fields
-   FilterEditor widget for creating single-field fules
-   FilterBar widget for compact layouts
-   Support for text, date and numeric values
-   Ability to format dates nad numbers
-   Ability to load filter options dynamically
-   Ability to localize labels and dates
-   Helpers for collecting options from data
-   Helpers for filtering data arrays
-   Integration with server side

## 0.8.0

### Updates

-   Migrate to svelte 5

## 0.7.2

### Updates

-   Use `wx-svelte-core` v1.2.3

## 0.7.1

### Fixes

-   Hardcoded date formats fully removed in favor of locale setttings
-   Regression for data filters with null value
-   Incorrect processing of tuple filter when value equals to 0

## 0.7.0

### New features

-   Tuple data type ( number field with text formatted labels )
-   Ability to define date formats through locale

## 0.6.2

### Fixes

-   Using beginsWith, endsWith, notBeginsWith, notEndsWith with numbers

## 0.6.1

### Fixes

-   Compatibility with latest `wx-svelte-menu` and `wx-svelte-core`

## 0.6.0

### Updates

-   Export getFilter, getFilters, filterByAll helpers
-   DE locale

## 0.5.3

### Fixes

-   Localize missing labels

## 0.2.0

### Updates

-   Config serialization format updated
