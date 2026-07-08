Alerte 1 :

Skip to main content
Grafana
Grafana


Home


Bookmarks


Starred


Dashboards


Explore

Drilldown


Assistant


Workspace

Investigations

Usage

Settings

Alerts & IRM


Service center

Alerting


Alert activity

New!
Alert rules

Notification configuration

Silences

History

Settings

IRM


SLO


Label management

AI & machine learning


Adaptive Telemetry

New!

Cost Management and Billing

New!

Testing & synthetics


Observability


Connections


Data sources

Collector Setup

Instrumentation Hub

Fleet Management

Add new connection

Integrations

Private data source connect

More apps


Administration


General


Plugins and data


Users and access


Users

Teams

Cloud access policies

Service accounts

Authentication

Advisor

Secrets Management

Trial (13 days left)
Alerts & IRM
Alerting
Alert rules
New alert rule
Search...
ctrl+k




Invite
User avatar
Ask Assistant
Handle alerts with confidence


Investigate alerts

Create alert rules

Understand alert conditions

New alert rule

1. Enter alert rule name
Enter a name to identify your alert rule.
Name
SmartLife — Backend indisponible

2. Define query and alert condition
Advanced options

Define query and alert condition
Need help?
Prometheus logo
grafanacloud-ilyas8888-prom
Options 
10m to now
Explain


Run queries


Metrics browser
  absent_over_time(http_server_requests_seconds_count{application="smartlife"}[2m])

Options
Legend: Auto
Format: Time series
Step: auto
Type: Instant
Table
{application="smartlife"}
1
Alert condition
WHEN QUERY

Is above
0
{application="smartlife"}
1
Firing

Preview alert rule condition

3. Add folder and labels
Organize your alert rule with a folder and set of labels.
Need help?
Folder
Select a folder to store your rule in.

SmartLife

New folder
Labels
Add labels to your rule for searching, silencing, or routing to a notification policy.
Need help?
No labels selected

Add labels

4. Set evaluation behavior
Define how the alert rule is evaluated.
Need help?
Evaluation group and interval
Evaluate every
or

New evaluation group
All rules in the selected group are evaluated every 1m.
Pending period
Period during which the threshold condition must be met to trigger an alert. Selecting "None" triggers the alert immediately once the condition is met.
2m

None

1m

2m

3m

4m

5m
Keep firing for
Period during which the alert will continue to show up as firing even though the threshold condition is no longer breached. Selecting "None" means the alert will be back to normal immediately.
0s

None

1m

2m

3m

4m

5m

Configure no data and error handling

5. Configure notifications
Advanced options

Select who should receive a notification when an alert rule fires.
Recipient
Notifications for firing alerts are routed to a selected contact point.
Need help?
Alertmanager:Alert manager logografana
Contact point
SmartLife Email
View or create contact points

Muting, grouping and timings (optional)

6. Configure notification message
Add more context to your alert notifications.
Need help?
Summary (optional)
Short summary of what happened and why.
Backend SmartLife ne répond plus depuis 2 minutes
Description (optional)
Description of what the alert rule does.
Enter a description...
Runbook URL (optional)
Webpage where you keep your runbook for the alert.
https://

Add custom annotation

Link dashboard and panel

Save

Cancel


Alerte 3 
Skip to main content
Grafana
Grafana


Home


Bookmarks


Starred


Dashboards


Explore

Drilldown


Assistant


Workspace

Investigations

Usage

Settings

Alerts & IRM


Service center

Alerting


Alert activity

New!
Alert rules

Notification configuration

Silences

History

Settings

IRM


SLO


Label management

AI & machine learning


Adaptive Telemetry

New!

Cost Management and Billing

New!

Testing & synthetics


Observability


Connections


Data sources

Collector Setup

Instrumentation Hub

Fleet Management

Add new connection

Integrations

Private data source connect

More apps


Administration


General


Plugins and data


Users and access


Users

Teams

Cloud access policies

Service accounts

Authentication

Advisor

Secrets Management

Trial (13 days left)
Alerts & IRM
Alerting
Alert rules
New alert rule
Search...
ctrl+k




Invite
User avatar
Ask Assistant
Handle alerts with confidence


Investigate alerts

Create alert rules

Understand alert conditions

New alert rule

1. Enter alert rule name
Enter a name to identify your alert rule.
Name
SmartLife — Latence p95 élevée

2. Define query and alert condition
Advanced options

Define query and alert condition
Need help?
Prometheus logo
grafanacloud-ilyas8888-prom
Options 
10m to now
Explain


Run queries


Metrics browser
  histogram_quantile(0.95,
    sum(rate(http_server_requests_seconds_bucket{
      application="smartlife",
      uri!~"/ws|/actuator.*"
    }[5m])) by (le)
  ) > 2

Options
Legend: Auto
Format: Time series
Step: auto
Type: Instant
Table
No data
Alert condition
WHEN QUERY

Is above
2
No data

Preview alert rule condition

3. Add folder and labels
Organize your alert rule with a folder and set of labels.
Need help?
Folder
Select a folder to store your rule in.

SmartLife

New folder
Labels
Add labels to your rule for searching, silencing, or routing to a notification policy.
Need help?
No labels selected

Add labels

4. Set evaluation behavior
Define how the alert rule is evaluated.
Need help?
Evaluation group and interval
Evaluate every
or

New evaluation group
All rules in the selected group are evaluated every 1m.
Pending period
Period during which the threshold condition must be met to trigger an alert. Selecting "None" triggers the alert immediately once the condition is met.
10m

None

1m

2m

3m

4m

5m
Keep firing for
Period during which the alert will continue to show up as firing even though the threshold condition is no longer breached. Selecting "None" means the alert will be back to normal immediately.
0s

None

1m

2m

3m

4m

5m

Configure no data and error handling

5. Configure notifications
Advanced options

Select who should receive a notification when an alert rule fires.
Recipient
Notifications for firing alerts are routed to a selected contact point.
Need help?
Alertmanager:Alert manager logografana
Contact point
SmartLife Email
View or create contact points

Muting, grouping and timings (optional)

6. Configure notification message
Add more context to your alert notifications.
Need help?
Summary (optional)
Short summary of what happened and why.
Latence p95 API > 2s depuis 10 minutes (hors WebSocket et Actuator)
Description (optional)
Description of what the alert rule does.
Enter a description...
Runbook URL (optional)
Webpage where you keep your runbook for the alert.
https://

Add custom annotation

Link dashboard and panel

Save

Cancel


Alerte 4
Skip to main content
Grafana
Grafana


Home


Bookmarks


Starred


Dashboards


Explore

Drilldown


Assistant


Workspace

Investigations

Usage

Settings

Alerts & IRM


Service center

Alerting


Alert activity

New!
Alert rules

Notification configuration

Silences

History

Settings

IRM


SLO


Label management

AI & machine learning


Adaptive Telemetry

New!

Cost Management and Billing

New!

Testing & synthetics


Observability


Connections


Data sources

Collector Setup

Instrumentation Hub

Fleet Management

Add new connection

Integrations

Private data source connect

More apps


Administration


General


Plugins and data


Users and access


Users

Teams

Cloud access policies

Service accounts

Authentication

Advisor

Secrets Management

Trial (13 days left)
Alerts & IRM
Alerting
Alert rules
New alert rule
Search...
ctrl+k




Invite
User avatar
Ask Assistant
Handle alerts with confidence


Investigate alerts

Create alert rules

Understand alert conditions

New alert rule

1. Enter alert rule name
Enter a name to identify your alert rule.
Name
SmartLife — Latence IA élevée

2. Define query and alert condition
Advanced options

Define query and alert condition
Need help?
Prometheus logo
grafanacloud-ilyas8888-prom
Options 
10m to now
Explain


Run queries


Metrics browser
 histogram_quantile(0.95,
    sum(rate(http_server_requests_seconds_bucket{
      application="smartlife",
      uri="/api/prompt"
    }[5m])) by (le)
  ) > 15

Options
Legend: Auto
Format: Time series
Step: auto
Type: Instant
Table
No data
Alert condition
WHEN QUERY

Is above
15
No data

Preview alert rule condition

3. Add folder and labels
Organize your alert rule with a folder and set of labels.
Need help?
Folder
Select a folder to store your rule in.

SmartLife

New folder
Labels
Add labels to your rule for searching, silencing, or routing to a notification policy.
Need help?
No labels selected

Add labels

4. Set evaluation behavior
Define how the alert rule is evaluated.
Need help?
Evaluation group and interval
Evaluate every
or

New evaluation group
All rules in the selected group are evaluated every 1m.
Pending period
Period during which the threshold condition must be met to trigger an alert. Selecting "None" triggers the alert immediately once the condition is met.
10m

None

1m

2m

3m

4m

5m
Keep firing for
Period during which the alert will continue to show up as firing even though the threshold condition is no longer breached. Selecting "None" means the alert will be back to normal immediately.
0s

None

1m

2m

3m

4m

5m

Configure no data and error handling

5. Configure notifications
Advanced options

Select who should receive a notification when an alert rule fires.
Recipient
Notifications for firing alerts are routed to a selected contact point.
Need help?
Alertmanager:Alert manager logografana
Contact point
SmartLife Email
View or create contact points

Muting, grouping and timings (optional)

6. Configure notification message
Add more context to your alert notifications.
Need help?
Summary (optional)
Short summary of what happened and why.
Endpoint /api/prompt p95 > 15s — AI service lent ou surchargé
Description (optional)
Description of what the alert rule does.
Enter a description...
Runbook URL (optional)
Webpage where you keep your runbook for the alert.
https://

Add custom annotation

Link dashboard and panel

Save

Cancel

Alerte 5

Skip to main content
Grafana
Grafana


Home


Bookmarks


Starred


Dashboards


Explore

Drilldown


Assistant


Workspace

Investigations

Usage

Settings

Alerts & IRM


Service center

Alerting


Alert activity

New!
Alert rules

Notification configuration

Silences

History

Settings

IRM


SLO


Label management

AI & machine learning


Adaptive Telemetry

New!

Cost Management and Billing

New!

Testing & synthetics


Observability


Connections


Data sources

Collector Setup

Instrumentation Hub

Fleet Management

Add new connection

Integrations

Private data source connect

More apps


Administration


General


Plugins and data


Users and access


Users

Teams

Cloud access policies

Service accounts

Authentication

Advisor

Secrets Management

Trial (13 days left)
Alerts & IRM
Alerting
Alert rules
New alert rule
Search...
ctrl+k




Invite
User avatar
Ask Assistant
Handle alerts with confidence


Investigate alerts

Create alert rules

Understand alert conditions

New alert rule

1. Enter alert rule name
Enter a name to identify your alert rule.
Name
SmartLife — Erreurs IA fréquentes

2. Define query and alert condition
Advanced options

Define query and alert condition
Need help?
Prometheus logo
grafanacloud-ilyas8888-prom
Options 
10m to now
Explain


Run queries


Metrics browser
sum(rate(http_server_requests_seconds_count{
    application="smartlife",
    uri="/api/prompt",
    status=~"5.."
  }[15m]))

Options
Legend: Auto
Format: Time series
Step: auto
Type: Instant
Alert condition
WHEN QUERY

Is above
0.01

Preview alert rule condition

3. Add folder and labels
Organize your alert rule with a folder and set of labels.
Need help?
Folder
Select a folder to store your rule in.

SmartLife

New folder
Labels
Add labels to your rule for searching, silencing, or routing to a notification policy.
Need help?
No labels selected

Add labels

4. Set evaluation behavior
Define how the alert rule is evaluated.
Need help?
Evaluation group and interval
Evaluate every
or

New evaluation group
All rules in the selected group are evaluated every 1m.
Pending period
Period during which the threshold condition must be met to trigger an alert. Selecting "None" triggers the alert immediately once the condition is met.
5m

None

1m

2m

3m

4m

5m
Keep firing for
Period during which the alert will continue to show up as firing even though the threshold condition is no longer breached. Selecting "None" means the alert will be back to normal immediately.
0s

None

1m

2m

3m

4m

5m

Configure no data and error handling

5. Configure notifications
Advanced options

Select who should receive a notification when an alert rule fires.
Recipient
Notifications for firing alerts are routed to a selected contact point.
Need help?
Alertmanager:Alert manager logografana
Contact point
SmartLife Email
View or create contact points

Muting, grouping and timings (optional)

6. Configure notification message
Add more context to your alert notifications.
Need help?
Summary (optional)
Short summary of what happened and why.
Taux d'erreurs 5xx sur /api/prompt > 0.01/sec depuis 5 minutes
Description (optional)
Description of what the alert rule does.
Enter a description...
Runbook URL (optional)
Webpage where you keep your runbook for the alert.
https://

Add custom annotation

Link dashboard and panel

Save

Cancel

Skip to main content
Grafana
Grafana

Alerte 6
Home


Bookmarks


Starred


Dashboards


Explore

Drilldown


Assistant


Workspace

Investigations

Usage

Settings

Alerts & IRM


Service center

Alerting


Alert activity

New!
Alert rules

Notification configuration

Silences

History

Settings

IRM


SLO


Label management

AI & machine learning


Adaptive Telemetry

New!

Cost Management and Billing

New!

Testing & synthetics


Observability


Connections


Data sources

Collector Setup

Instrumentation Hub

Fleet Management

Add new connection

Integrations

Private data source connect

More apps


Administration


General


Plugins and data


Users and access


Users

Teams

Cloud access policies

Service accounts

Authentication

Advisor

Secrets Management

Trial (13 days left)
Alerts & IRM
Alerting
Alert rules
New alert rule
Search...
ctrl+k




Invite
User avatar
Ask Assistant
Handle alerts with confidence


Investigate alerts

Create alert rules

Understand alert conditions

New alert rule

1. Enter alert rule name
Enter a name to identify your alert rule.
Name
SmartLife — Pic d'échecs OTP

2. Define query and alert condition
Advanced options

Define query and alert condition
Need help?
Prometheus logo
grafanacloud-ilyas8888-prom
Options 
10m to now
Explain


Run queries


Metrics browser
  sum(rate(http_server_requests_seconds_count{
    application="smartlife",
    uri="/api/auth/verify-otp",
    status=~"4.."
  }[5m]))

Options
Legend: Auto
Format: Time series
Step: auto
Type: Instant
Alert condition
WHEN QUERY

Is above
0.1

Preview alert rule condition

3. Add folder and labels
Organize your alert rule with a folder and set of labels.
Need help?
Folder
Select a folder to store your rule in.

SmartLife

New folder
Labels
Add labels to your rule for searching, silencing, or routing to a notification policy.
Need help?
No labels selected

Add labels

4. Set evaluation behavior
Define how the alert rule is evaluated.
Need help?
Evaluation group and interval
Evaluate every
or

New evaluation group
All rules in the selected group are evaluated every 1m.
Pending period
Period during which the threshold condition must be met to trigger an alert. Selecting "None" triggers the alert immediately once the condition is met.
5m

None

1m

2m

3m

4m

5m
Keep firing for
Period during which the alert will continue to show up as firing even though the threshold condition is no longer breached. Selecting "None" means the alert will be back to normal immediately.
0s

None

1m

2m

3m

4m

5m

Configure no data and error handling

5. Configure notifications
Advanced options

Select who should receive a notification when an alert rule fires.
Recipient
Notifications for firing alerts are routed to a selected contact point.
Need help?
Alertmanager:Alert manager logografana
Contact point
SmartLife Email
View or create contact points

Muting, grouping and timings (optional)

6. Configure notification message
Add more context to your alert notifications.
Need help?
Summary (optional)
Short summary of what happened and why.
Echecs OTP > 0.1/sec (≈6/min) — possible tentative de brute-force
Description (optional)
Description of what the alert rule does.
Enter a description...
Runbook URL (optional)
Webpage where you keep your runbook for the alert.
https://

Add custom annotation

Link dashboard and panel

Save

Cancel

