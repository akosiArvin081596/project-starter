# Shared command names: every project uses these targets, whatever the stack.
# Details: docs/commands.md. GNU Make 3.81 compatible (no .ONESHELL, .RECIPEPREFIX,
# undefine or grouped targets). Changing this file is a guarded change.
#
# A target that isn't filled in yet prints "not configured: fill in for your stack" on
# stderr and its recipe exits 3. (GNU make itself then exits 2 and reports "Error 3";
# CI, the git hooks and the team-* commands read that as "not set up yet" and skip.)
# /team:new-project replaces each $(NOT_CONFIGURED) line with the stack's command.

.DEFAULT_GOAL := help

NOT_CONFIGURED = echo "$@: not configured: fill in for your stack" >&2; exit 3

# ---- pack commands (team-*) ---------------------------------------------------------
# Inside Claude Code the team plugin puts its bin/ on PATH. Outside it, set TEAM_BIN
# (environment, or TEAM_BIN= in the pack's defaults.conf) to the plugin's bin/ folder.
# Recipes call team-* commands by name, never through a variable, and inside a shell line
# (Make 3.81 looks up a plain one-word command in its original PATH, not the exported one).
ifeq ($(strip $(TEAM_CONFIG_DIR)),)
TEAM_CONFIG_DIR := $(HOME)/.config/team
endif
ifeq ($(strip $(TEAM_BIN)),)
TEAM_BIN := $(shell sed -n 's/^TEAM_BIN=//p' "$(TEAM_CONFIG_DIR)/defaults.conf" 2>/dev/null | tail -n 1 | sed -e 's/^"\(.*\)"$$/\1/' -e "s|^~/|$$HOME/|")
endif
ifneq ($(strip $(TEAM_BIN)),)
ifeq ($(CLAUDECODE),1)
export PATH := $(PATH):$(TEAM_BIN)
else
export PATH := $(TEAM_BIN):$(PATH)
endif
endif

# ---- project settings (ops/project.conf; parsed, never sourced) ----------------------
conf_get = $(shell sed -n 's/^$(1)=//p' ops/project.conf 2>/dev/null | tail -n 1 | sed -e 's/^"\(.*\)"$$/\1/')
ifeq ($(strip $(ARTIFACT_DIR)),)
ARTIFACT_DIR := $(call conf_get,ARTIFACT_DIR)
endif
ifeq ($(strip $(ARTIFACT_DIR)),)
ARTIFACT_DIR := .team/artifact
endif
export ARTIFACT_DIR

.PHONY: help setup dev lint format-check test e2e build audit migrate seed db-pull anonymize-check hooks

help: ## List the shared targets
	@echo "Shared targets (docs/commands.md):"
	@awk 'BEGIN { FS = ":.*## " } /^[a-z][a-z0-9-]*:.*## / { printf "  make %-16s %s\n", $$1, $$2 }' $(firstword $(MAKEFILE_LIST))

setup: ## Install dependencies and prepare this checkout (run by team-new-worktree)
	@$(NOT_CONFIGURED)

dev: ## Run the app on PORT from the env file (team-app runs this in the background)
	@$(NOT_CONFIGURED)

lint: ## Linters and type checks
	@$(NOT_CONFIGURED)

format-check: ## Check formatting without changing files (pre-commit hook)
	@$(NOT_CONFIGURED)

test: ## Fast tests (unit and integration), with TZ=UTC
	@$(NOT_CONFIGURED)

e2e: ## Playwright smoke and timezone tests (e2e/) against BASE_URL or APP_URL
	@cd e2e && if [ ! -d node_modules/@playwright/test ]; then npm ci --no-audit --no-fund; fi && ./node_modules/.bin/playwright install $${CI:+--with-deps} chromium && ./node_modules/.bin/playwright test $(E2E_ARGS)

# build must fill $(ARTIFACT_DIR) with exactly the release that gets deployed, including
# whatever MIGRATE_CMD needs on the server (the pipeline adds ops/ itself). For example:
#	@dir="$(ARTIFACT_DIR)"; rm -rf "$${dir:?}" && mkdir -p "$$dir" && <build into "$$dir">
build: ## Build the release into ARTIFACT_DIR (default .team/artifact)
	@$(NOT_CONFIGURED)

audit: ## Dependency audit (known vulnerabilities)
	@$(NOT_CONFIGURED)

migrate: ## Apply database migrations (expand/contract only; MIGRATE_CMD on deploy)
	@$(NOT_CONFIGURED)

seed: ## Load fake seed data into this checkout's database (SEED_CMD)
	@$(NOT_CONFIGURED)

db-pull: ## Restore the sanitized snapshot into this worktree's DB; FRESH=1 downloads the newest first
	@command -v team-db-pull >/dev/null 2>&1 || { echo "db-pull: team-db-pull not found. Run inside Claude Code with the team plugin, or set TEAM_BIN in $(TEAM_CONFIG_DIR)/defaults.conf" >&2; exit 5; }; \
	team-db-pull $(if $(filter 1 yes true,$(FRESH)),--fresh)

anonymize-check: ## Prove ops/anonymize covers the schema (run against fake seed data)
	@$(NOT_CONFIGURED)

hooks: ## Point git at .githooks (via team-hooks; chains to an existing hooks path)
	@command -v team-hooks >/dev/null 2>&1 || { echo "hooks: team-hooks not found. Run inside Claude Code with the team plugin, or set TEAM_BIN in $(TEAM_CONFIG_DIR)/defaults.conf" >&2; exit 5; }; \
	team-hooks
