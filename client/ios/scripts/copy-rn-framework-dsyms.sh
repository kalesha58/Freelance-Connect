#!/usr/bin/env bash
# Copies dSYM bundles shipped inside React Native prebuilt xcframeworks (React,
# ReactNativeDependencies, Hermes) into DWARF_DSYM_FOLDER_PATH so Xcode archives
# include them for crash symbolication / App Store validation.
set -euo pipefail

if [[ -z "${DWARF_DSYM_FOLDER_PATH:-}" ]]; then
  exit 0
fi

IOS_ROOT="${SRCROOT:?}"
PODS="${IOS_ROOT}/Pods"

copy_dsyms_under() {
  local dir="$1"
  [[ -d "$dir" ]] || return 0
  local dsym
  while IFS= read -r dsym; do
    [[ -n "$dsym" ]] || continue
    local name
    name="$(basename "$dsym")"
    echo "note: [RN dSYM] copying ${name}"
    rm -rf "${DWARF_DSYM_FOLDER_PATH:?}/${name}"
    cp -R "${dsym}" "${DWARF_DSYM_FOLDER_PATH}/"
  done < <(find "$dir" -type d -name "*.dSYM" 2>/dev/null)
}

copy_dsyms_under "${PODS}/React-Core-prebuilt"
copy_dsyms_under "${PODS}/ReactNativeDependencies"
copy_dsyms_under "${PODS}/hermes-engine"
