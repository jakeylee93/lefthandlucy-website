#!/usr/bin/env bash
# Rewrites integrations/anyvendor/{manifest,content,field-map}.json from a running build (default http://localhost:3000).
set -euo pipefail
BASE="${1:-http://localhost:3000}"
curl -fsS "$BASE/site-manifest" | python3 -c '
import json,sys
d=json.load(sys.stdin)["anyvendor"]
def w(n,o): open("integrations/anyvendor/"+n,"w").write(json.dumps(o,indent=2,ensure_ascii=False)+"\n")
w("manifest.json",d["manifest"]); w("content.json",d["content"])
w("field-map.json",{"schema":d["schema"],"slug":d["slug"],"kind":d["kind"],"marker":"data-av-field on the element (set on /preview?token=…&av_edit=1); data-av-chapter on each chapter wrapper","renderedBy":"app/home.tsx and app/services-carousel.tsx","fields":d["fields"] if "fields" in d else d["elements"]})'
