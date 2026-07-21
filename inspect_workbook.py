import json
from pathlib import Path

import pandas as pd

workbook_path = Path(r"Z:\Wagmi\Wagmi Files\zich scripts(AutoRecovered).xlsx")

xl = pd.ExcelFile(workbook_path)
summary = []
for sheet_name in xl.sheet_names:
    df = xl.parse(sheet_name, dtype=object)
    df = df.dropna(how="all")
    nonempty_cols = [str(c) for c in df.columns if not df[c].isna().all()]
    sample = df.head(5).where(pd.notna(df.head(5)), None).to_dict(orient="records")
    summary.append(
        {
            "sheet": sheet_name,
            "rows": int(len(df)),
            "columns": nonempty_cols,
            "sample": sample,
        }
    )

print(json.dumps(summary, ensure_ascii=True, indent=2, default=str))
