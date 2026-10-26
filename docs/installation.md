# Installation Guide — Generic Interactive USA Map

## Overview

This guide explains how to install the Generic Interactive USA Map component in an Adobe Experience Manager (AEM) as a Cloud Service project.

The component is primarily designed to display aggregated **AEM Adaptive Form submissions by U.S. state**, but it can visualize any compatible state-based numeric dataset provided by a REST API.

## 1. Prerequisites

- AEM as a Cloud Service project with a `ui.apps` module.
- Access to the project's source code and deployment pipeline.
- An AEM Sites editable template.
- A REST API returning compatible JSON.
- Internet access to D3.js, TopoJSON, and US Atlas resources, unless these dependencies are hosted locally.

## 2. Download the Component

Clone the Generic USA Map GitHub repository or download its source code.

The repository contains:

```text
component/
frontend/
clientlib/
examples/
docs/
```

The `component` directory contains the HTL template and authoring dialog.

The `clientlib` directory contains the compiled JavaScript and CSS assets required to render the map.

## 3. Install the AEM Component

Copy the contents of the repository's `component` directory into:

```text
ui.apps/src/main/content/jcr_root/apps/generic/components/usamap/
```

The resulting structure should be:

```text
usamap/
├── .content.xml
├── usamap.html
└── _cq_dialog/
    └── .content.xml
```

The component uses the resource type:

```text
generic/components/usamap
```

Its component group is:

```text
Generic Data Visualization
```

## 4. Install the Client Library

Copy the repository's `clientlib` directory into:

```text
ui.apps/src/main/content/jcr_root/apps/generic/clientlibs/clientlib-usamap/
```

The resulting structure should be:

```text
clientlib-usamap/
├── .content.xml
├── css.txt
├── js.txt
├── css/
│   └── usa-map.css
└── js/
    └── usa-map.js
```

Verify that the client library definition contains:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root
    xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="cq:ClientLibraryFolder"
    categories="[generic.usamap]"
    allowProxy="{Boolean}true"/>
```

The component's HTL must reference the same client library category:

```text
generic.usamap
```

The `allowProxy` property permits AEM to serve the client library through its supported `/etc.clientlibs/` proxy path.

## 5. Update FileVault Filters

Verify that the `ui.apps` content package includes the component and client library paths.

Depending on the existing project structure, add appropriate filters to:

```text
ui.apps/src/main/content/META-INF/vault/filter.xml
```

Example:

```xml
<filter root="/apps/generic/components/usamap"/>
<filter root="/apps/generic/clientlibs/clientlib-usamap"/>
```

Add these entries inside the existing `<workspaceFilter>` element.

Preserve the project's existing filters and repository ownership conventions.

If the project uses a separate repository structure package, update its repository definitions as required.

## 6. Build the AEM Project

From the AEM Maven project root, run:

```cmd
mvn clean verify -DskipTests
```

Verify that Maven reports:

```text
BUILD SUCCESS
```

The build should include the component definition, HTL, authoring dialog, and client library.

## 7. Deploy to AEM

Commit the component changes to the AEM project's Git repository.

Deploy using the configured Adobe Cloud Manager pipeline.

After deployment, verify that the component exists at:

```text
/apps/generic/components/usamap
```

and the client library exists at:

```text
/apps/generic/clientlibs/clientlib-usamap
```

## 8. Enable the Component in an AEM Template

1. Open AEM Author.
2. Navigate to **Tools → General → Templates**.
3. Open the template used by the target page.
4. Switch to Structure mode.
5. Select the appropriate Layout Container.
6. Open its Policy settings.
7. Under Allowed Components, locate **Generic Data Visualization**.
8. Enable **Generic Interactive USA Map**.
9. Save the policy.

The component should now be available in the AEM Sites component browser.

## 9. Add the Component to a Page

Open an AEM Sites page in Edit mode.

Drag **Generic Interactive USA Map** into an allowed container.

Open the component's Configure dialog.

### General settings

| Property | Example |
|---|---|
| Map Title | USA Form Submissions |
| Metric Label | Submissions |
| Show Summary Statistics | Enabled |

### Data Source settings

| Property | Example |
|---|---|
| Data Source Type | REST API |
| Data Endpoint | `https://api.example.com/states/counts` |
| State Field | `state` |
| Value Field | `count` |

### Interaction settings

Enable or disable state tooltips as required.

Save the component configuration.

## 10. REST API Response Format

The REST endpoint must return a compatible JSON response.

Example:

```json
{
  "states": [
    { "state": "CA", "count": 150 },
    { "state": "TX", "count": 95 },
    { "state": "NY", "count": 70 }
  ]
}
```

Each state record must contain a two-letter U.S. state code and a numeric value.

Field names can be configured in the component dialog.

The backend API is responsible for retrieving, aggregating, and formatting data into the expected state-level structure.

The component does not query databases or aggregate individual form submissions.

## 11. External REST API Requirements

When using an external REST endpoint:

- Use HTTPS.
- Configure CORS to permit requests from the AEM Sites origin.
- Ensure the site's Content Security Policy allows the external API origin through `connect-src`.
- Return valid JSON using the expected response structure.
- Do not place API keys or credentials in component properties.

For protected APIs, use an appropriately authenticated backend integration rather than exposing secrets in browser JavaScript.

## 12. Verify the Installation

After publishing the page:

1. Confirm the map renders correctly.
2. Verify that state values match the REST API response.
3. Check that summary statistics are displayed.
4. Click a state and verify its corresponding value.
5. Confirm tooltips work when enabled.
6. Inspect the browser console for JavaScript errors.
7. Verify that the REST API request returns HTTP 200.

## 13. Troubleshooting

| Issue | Possible cause |
|---|---|
| Component not visible | Component group or template policy |
| Map does not render | JavaScript dependency or client library loading issue |
| REST API returns 404 | Incorrect endpoint |
| REST API returns 401 | Authentication failure |
| CORS error | External API does not allow the AEM origin |
| CSP error | AEM site blocks the external API origin |
| No state values displayed | Incorrect JSON field mappings |
| Map loads slowly | REST API latency or external dependency loading |

## 14. Component Scope

The component is intended for displaying aggregated state-level numeric data.

Its primary use case is visualizing AEM Adaptive Form submissions by U.S. state.

It can also be used for sales, customer distribution, marketing activity, and other compatible datasets.

The component does not include individual submission viewing or state-level record drill-down.

## Conclusion

The Generic Interactive USA Map provides a reusable geographic visualization capability for AEM Sites.

By configuring a compatible REST API endpoint and JSON field mappings, developers and content authors can visualize state-based metrics without modifying the component's rendering code or depending on a specific backend technology.