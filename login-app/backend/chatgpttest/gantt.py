import matplotlib.pyplot as plt
import pandas as pd

# Define Gantt data based on the user's milestone checklist
tasks = [
    ("Initial Planning and Research", "2024-08-19", "2024-09-13"),
    ("Milestone 1: Finalise scope", "2024-08-19", "2024-08-26"),
    ("Milestone 2: Market research", "2024-08-26", "2024-09-02"),
    ("Milestone 3: Tech stack research", "2024-09-02", "2024-09-08"),
    ("Architecture Design", "2024-09-16", "2024-10-25"),
    ("Milestone 4: Architecture design", "2024-09-16", "2024-09-22"),
    ("Milestone 5: Database design", "2024-09-22", "2024-09-29"),
    ("Milestone 6: Feedback & refine", "2024-09-29", "2024-10-06"),
    ("Frontend/Backend Prototyping", "2024-10-28", "2024-11-15"),
    ("Milestone 7: UI wireframes", "2024-10-14", "2024-10-28"),
    ("Milestone 8: Backend setup", "2024-10-28", "2024-11-03"),
    ("Milestone 9: Integration", "2024-11-03", "2024-11-10"),
    ("Core Feature Development", "2024-11-18", "2024-12-06"),
    ("Milestone 10: Core features", "2024-11-17", "2024-11-24"),
    ("Milestone 11: Testing", "2024-11-24", "2024-12-01"),
    ("Milestone 12: Supplier integration", "2024-12-01", "2024-12-06"),
    ("Testing and Refinement", "2025-01-13", "2025-02-09"),
    ("Milestone 13: UI testing", "2024-12-10", "2024-12-15"),
    ("Milestone 14: Unit testing", "2024-12-15", "2024-12-29"),
    ("Milestone 15: Refinement", "2024-12-29", "2025-01-27"),
    ("Milestone 16: Quotation templates", "2025-01-27", "2025-02-09"),
    ("Beta Testing", "2025-02-10", "2025-03-09"),
    ("Milestone 17: Beta test", "2025-02-23", "2025-02-28"),
    ("Milestone 18: Final changes", "2025-03-01", "2025-03-09"),
    ("Final Presentation", "2025-03-10", "2025-04-01"),
    ("Milestone 19: Prep final presentation", "2025-03-24", "2025-03-31"),
    ("Milestone 20: Submit & Present", "2025-04-01", "2025-04-01")
]

# Convert to DataFrame
df = pd.DataFrame(tasks, columns=["Task", "Start", "End"])
df["Start"] = pd.to_datetime(df["Start"])
df["End"] = pd.to_datetime(df["End"])
df["Duration"] = (df["End"] - df["Start"]).dt.days
df["Task"] = df["Task"].astype("category")
df["TaskID"] = df["Task"].cat.codes

# Create Gantt Chart
fig, ax = plt.subplots(figsize=(12, 10))
for idx, row in df.iterrows():
    ax.barh(row["TaskID"], row["Duration"], left=row["Start"], color="skyblue")

ax.set_yticks(df["TaskID"])
ax.set_yticklabels(df["Task"])
ax.invert_yaxis()
ax.set_xlabel("Date")
ax.set_title("SmartQuote FYP Gantt Chart (Aug 2024 – Apr 2025)")
plt.tight_layout()

# Save chart
plt.savefig("./gantt_chart_smartquote.png")
plt.close()