# Generic Interactive USA Map for AEM Sites

A reusable **Adobe Experience Manager (AEM) Sites component** for visualizing **AEM Adaptive Form submissions by U.S. state** using an interactive geographic map.

The component is datasource-independent and supports any compatible REST API returning aggregated state-level data in JSON format.

## Overview

The Generic Interactive USA Map provides a visual representation of form submission activity across the United States.

It enables users to identify states with higher submission volumes, view aggregated submission counts, and explore geographic trends.

Although primarily designed for AEM Forms submission dashboards, the component can also visualize sales, customer distribution, service requests, and other state-based metrics.

## Features

- Interactive geographic USA map powered by D3.js and TopoJSON.
- Dynamic state coloring based on numeric values.
- Configurable REST API endpoint.
- Configurable JSON state and value field mappings.
- Customizable map title and metric label.
- Summary statistics for total values, represented states, and top-performing state.
- Interactive state selection and optional tooltips.
- Responsive design and keyboard-based state selection.
- Support for external HTTPS REST APIs and same-origin AEM endpoints.
- No dependency on a specific database or cloud provider.

## REST API Data Contract

The component expects an HTTP GET endpoint returning aggregated state-level JSON data.

### Example

```json
{
  "states": [
    { "state": "CA", "count": 150 },
    { "state": "TX", "count": 95 },
    { "state": "NY", "count": 70 }
  ]
}
```

The `states` array contains records with a two-letter U.S. state code and a numeric value.

Field names are configurable through the AEM authoring dialog.

For example, an API returning `stateCode` and `totalSubmissions` can be used by configuring those properties as the State Field and Value Field.

The component also accepts a top-level array of state records.

**The backend API is responsible for retrieving, aggregating, and formatting the data into the expected JSON structure.** The component does not query databases or aggregate individual submissions.

## AEM Component Configuration

Authors configure the component using the AEM Touch UI dialog.

| Property | Description |
|---|---|
| Map Title | Heading displayed above the map |
| Metric Label | Description of the numeric metric |
| Data Source Type | REST API, AEM endpoint, or static JSON |
| Data Endpoint | URL returning the state-level JSON |
| State Field | JSON property containing the state code |
| Value Field | JSON property containing the numeric value |
| Show Summary Statistics | Enables or disables summary cards |
| Show Tooltips | Enables or disables state tooltips |

The datasource type is descriptive in the current implementation. Data is retrieved through HTTP GET regardless of the selected type.

## Installation

See the [Installation Guide](docs/installation.md) for instructions on adding the component to an AEM as a Cloud Service project.

The installation includes the AEM component definition, HTL template, authoring dialog, JavaScript, CSS, and client library configuration.

## Example Datasources

### AEM Forms Submissions

A REST API returns aggregated Adaptive Form submission counts by U.S. state.

The API can be backed by Azure SQL, another database, or a different backend service.

### External REST API

The component has also been tested against a Node.js REST API hosted on Render:

`https://ic-document-service.onrender.com/api/states/sales`

This example demonstrates that the component can visualize state-based metrics from an external REST service without depending on Azure SQL.

See [Sample JSON Response](examples/sample-response.json).

## Repository Structure

```text
aem-generic-usa-map/
├── README.md
├── component/
│   ├── .content.xml
│   ├── usamap.html
│   └── _cq_dialog/
│       └── .content.xml
├── frontend/
│   ├── usa-map.js
│   └── usa-map.scss
├── clientlib/
│   ├── .content.xml
│   ├── css.txt
│   ├── js.txt
│   ├── css/
│   │   └── usa-map.css
│   └── js/
│       └── usa-map.js
├── examples/
│   └── sample-response.json
└── docs/
    └── installation.md
```

## REST API Requirements

External REST APIs must:

- Use HTTPS.
- Return compatible JSON.
- Allow CORS requests from the AEM Sites origin.
- Be permitted by the site's Content Security Policy.
- Avoid requiring credentials embedded in browser-side component configuration.

For protected APIs, use an authenticated backend endpoint or secure proxy that keeps credentials server-side.

## Technology Stack

- Adobe Experience Manager as a Cloud Service
- AEM HTL and Granite UI
- JavaScript and SCSS
- D3.js
- TopoJSON / US Atlas
- AEM Client Libraries
- JSON REST APIs

## Current Scope

The component displays aggregated numeric data by U.S. state.

It supports configurable REST data retrieval, geographic visualization, summary statistics, tooltips, and state selection.

It does not retrieve or display individual form submission records.

## License

License information will be added after the appropriate open-source license and third-party dependency requirements have been reviewed.