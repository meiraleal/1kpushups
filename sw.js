const FILE_BUNDLE={"/modules/apps/admin/views/template.js":{content:`export default ({ T, html, $APP }) => ({
	tag: "admin-template",

	properties: {
		component: T.object(),
		horizontal: T.boolean(true),
		full: T.boolean(true),
		currentRoute: T.object({ sync: "ram" }),
		class: T.string("flex"),
	},
	render() {
		const { modules } = $APP;
		const navbarItems = modules
			? Object.keys($APP.settings)
					.filter((ext) => $APP.settings[ext]?.appbar)
					.map((ext) => ({
						...$APP.settings[ext].appbar,
						label: ext,
						href: \`/admin/\${ext}\`,
					}))
					.map(
						(item) => html\`
              <uix-button
                label=\${item.label}
                href=\${item.href}
                icon=\${item.icon}
                hideLabel
                tooltip
                vertical
                selectable
                ghost
                iconSize="lg"
                class="w-full"
              ></uix-button>
            \`,
					)
			: [];

		return html\`
      <div class="flex flex-col flex-shrink-0 justify-between bg-gray-100">
        <uix-navbar class="w-full flex flex-col">\${navbarItems}</uix-navbar>
        <uix-navbar class="w-full flex flex-col">
          <uix-darkmode
              hideLabel               
              tooltip
              vertical
              ghost
              iconSize="lg"
              label="Dark Mode"
              class="w-full"></uix-darkmode>            
          <uix-button
          icon="settings"
          hideLabel
          tooltip
          vertical
          ghost
          iconSize="lg"
          label="Settings"
          class="w-full"></uix-button>
          </uix-navbar>
      </div>
      <div class="flex flex-1 h-full">
        \${this.component}
      </div>
    \`;
	},
});
`,mimeType:"application/javascript",skipSW:!1},"/modules/uix/navigation/navbar.js":{content:`export default ({ T }) => ({
	tag: "uix-navbar",
	style: true,
	extends: "uix-list",
	properties: {
		join: T.boolean({ defaultValue: true }),
		docked: T.string(),
	},
});
`,mimeType:"application/javascript",skipSW:!1},"/modules/uix/display/button.js":{content:`export default ({ T }) => ({
	tag: "uix-button",
	properties: { variant: T.string("default") },
	extends: "uix-link",
	style: true,
	setVariant() {
		const { variant } = this;
		this.style.setProperty(
			"--_variant-color-50",
			\`var(--colors-\${variant}-50)\`,
		);
		this.style.setProperty(
			"--_variant-color-300",
			\`var(--colors-\${variant}-300)\`,
		);
		this.style.setProperty(
			"--_variant-color-400",
			\`var(--colors-\${variant}-400)\`,
		);
		this.style.setProperty(
			"--_variant-color-500",
			\`var(--colors-\${variant}-500)\`,
		);
		this.style.setProperty(
			"--_variant-color-600",
			\`var(--colors-\${variant}-600)\`,
		);
		this.style.setProperty(
			"--_variant-color-700",
			\`var(--colors-\${variant}-700)\`,
		);
		this.style.setProperty(
			"--_variant-color-800",
			\`var(--colors-\${variant}-800)\`,
		);
	},
	connected() {
		this.setVariant();
	},
	willUpdate(changedProps) {
		if (Object.keys(changedProps).includes("variant")) {
			this.setVariant();
		}
	},
});
`,mimeType:"application/javascript",skipSW:!1},"/modules/uix/utility/darkmode.js":{content:`export default ({ T }) => ({
	tag: "uix-darkmode",
	extends: "uix-button",
	icons: ["moon", "sun"],
	properties: {
		width: T.string({ defaultValue: "fit" }),
		darkmode: T.boolean({
			sync: "local",
			defaultValue: true,
		}),
	},

	click(e) {
		e.stopPropagation();
		this.darkmode = !this.darkmode;
		this.icon = this.darkmode ? "sun" : "moon";
	},
	willUpdate(changedProps) {
		console.log({ changedProps });
		if (Object.hasOwn(changedProps, "darkmode"))
			document.documentElement.classList.toggle("dark");
	},
	connected() {
		this.icon = this.darkmode ? "sun" : "moon";
		if (this.darkmode) document.documentElement.classList.add("dark");
	},
});
`,mimeType:"application/javascript",skipSW:!1},"/modules/apps/bundler/views/ui.js":{content:`export default ({ T, html, $APP, Bundler }) => {
	$APP.define("credentials-manager", {
		class: "flex flex-col gap-4 p-4 border rounded-lg shadow-md bg-white",
		properties: {
			row: T.object(),
		},
		render() {
			if (!this.row)
				return html\`<div class="text-center p-4">Loading credentials...</div>\`;

			return html\`
      <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">
        Deployment Credentials
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <uix-input
          label="Owner"
          .value=\${this.row.owner}
          @change=\${(e) => (this.row.owner = e.target.value)}
        ></uix-input>
        <uix-input
          label="Repository"
          .value=\${this.row.repo}
          @change=\${(e) => (this.row.repo = e.target.value)}
        ></uix-input>
        <uix-input
          label="Branch"
          .value=\${this.row.branch}
          @change=\${(e) => (this.row.branch = e.target.value)}
        ></uix-input>
        <uix-input
          label="GitHub Token"
          type="password"
          .value=\${this.row.token}
          @change=\${(e) => (this.row.token = e.target.value)}
        ></uix-input>
      </div>
      <div class="flex justify-end">
        <uix-button
          @click=\${() => $APP.Model.credentials.edit({ ...this.row })}
          label="Save Credentials"
        ></uix-button>
      </div>
    \`;
		},
	});

	$APP.define("release-creator", {
		class: "flex flex-col gap-4 p-4 border rounded-lg shadow-md bg-white",
		properties: {
			version: T.string(\`v\${new Date().toISOString().slice(0, 10)}\`),
			notes: T.string(""),
			deploymentType: T.string(null), // Can be 'spa', 'ssg', or null
		},
		async handleDeploy(type) {
			this.deploymentType = type;
			const credentials = await $APP.Model.credentials.get("singleton");
			if (!credentials || !credentials.token) {
				alert("Please provide a GitHub token before deploying.");
				this.deploymentType = null;
				return;
			}

			let newRelease;
			try {
				newRelease = await $APP.Model.releases.add({
					version: this.version,
					notes: this.notes,
					status: "pending",
					deployedAt: new Date(),
					deployType: type,
				});
				console.log({ Bundler });
				const files =
					type === "spa"
						? await Bundler.bundleSPA(credentials)
						: await Bundler.bundleSSG(credentials);

				await $APP.Model.releases.edit({
					...newRelease,
					status: "success",
					files,
				});

				alert(\`Deployment (\${type.toUpperCase()}) successful!\`);
			} catch (error) {
				console.error(\`Deployment failed for \${type.toUpperCase()}:\`, error);
				alert(\`Deployment failed: \${error.message}\`);
				if (newRelease?._id) {
					await $APP.Model.releases.edit({
						...newRelease,
						status: "failed",
					});
				}
			} finally {
				this.deploymentType = null;
			}
		},
		render() {
			return html\`
      <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">
        New Release
      </h2>
      <uix-input
        label="Version"
        .value=\${this.version}
        @change=\${(e) => (this.version = e.target.value)}
      ></uix-input>
      <uix-input
        type="textarea"
        label="Release Notes"
        .value=\${this.notes}
        @change=\${(e) => (this.notes = e.target.value)}
      ></uix-input>
      <div class="flex justify-end gap-2">
        <uix-button
          @click=\${() => this.handleDeploy("spa")}
          label=\${this.deploymentType === "spa" ? "Deploying..." : "Deploy SPA"}
          ?disabled=\${this.deploymentType !== null}
        ></uix-button>
        <uix-button
          @click=\${() => this.handleDeploy("ssg")}
          label=\${this.deploymentType === "ssg" ? "Deploying..." : "Deploy SSG"}
          ?disabled=\${this.deploymentType !== null}
        ></uix-button>
      </div>
    \`;
		},
	});

	/**
	 * A component to display the history of releases.
	 * It lists all past deployments with their version, status, and deployment date.
	 */
	$APP.define("release-history", {
		class: "flex flex-col gap-4 p-4 border rounded-lg shadow-md bg-white",
		properties: {
			rows: T.array(),
		},
		getStatusClass(status) {
			switch (status) {
				case "success":
					return "bg-green-100 text-green-800";
				case "failed":
					return "bg-red-100 text-red-800";
				default:
					return "bg-yellow-100 text-yellow-800";
			}
		},
		render() {
			return html\`
      <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">
        Release History
      </h2>
      <div class="flex flex-col gap-3">
        \${
					this.rows && this.rows.length > 0
						? this.rows
								.sort((a, b) => new Date(b.deployedAt) - new Date(a.deployedAt))
								.map(
									(release) => html\`
                  <div
                    class="flex flex-col p-2 rounded-md \${this.getStatusClass(
											release.status,
										)}"
                  >
                    <div class="grid grid-cols-3 items-center gap-2">
                      <div class="font-semibold">\${release.version}</div>
                      <div class="flex items-center gap-2">
                        <span>\${release.status}</span>
                        \${
													release.deployType
														? html\`<span
                                    class="text-xs font-mono px-2 py-1 rounded bg-gray-200 text-gray-700"
                                    >\${release.deployType.toUpperCase()}</span
                                  >\`
														: ""
												}
                      </div>
                      <div class="text-sm text-right">
                        \${new Date(release.deployedAt).toLocaleString()}
                      </div>
                    </div>
                    \${
											release.notes
												? html\`<p class="text-sm text-gray-600 pt-2">
                                \${release.notes}
                              </p>\`
												: ""
										}
                  </div>
                \`,
								)
						: html\`<p class="text-center text-gray-500">
                    No releases yet.
                  </p>\`
				}
      </div>
    \`;
		},
	});

	// Add this new component to bundler-ui.js

	$APP.define("settings-editor", {
		class: "flex flex-col gap-4 p-4 border rounded-lg shadow-md bg-white",
		properties: {
			_settings: T.object(null), // Will hold the app settings
		},
		// Fetch settings when the component is added to the page
		connected() {
			this._settings = $APP.settings; // Assumes a function to get all current settings
		},
		async handleSave() {
			try {
				// The user provided \`$APP.settings.set()\` which we'll use here
				await $APP.settings.set(this._settings);
				alert("Settings saved successfully!");
			} catch (error) {
				console.error("Failed to save settings:", error);
				alert("Error saving settings. Check the console for details.");
			}
		},
		render() {
			if (!this._settings) {
				return html\`<div class="text-center p-4">Loading settings...</div>\`;
			}
			return html\`
            <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">
                App Settings
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <uix-input
                    label="App Name"
                    .value=\${this._settings.name}
                    @change=\${(e) => (this._settings.name = e.target.value)}
                ></uix-input>
                <uix-input
                    label="Short Name"
                    .value=\${this._settings.short_name}
                    @change=\${(e) => (this._settings.short_name = e.target.value)}
                ></uix-input>
                <uix-input
                    label="Start URL"
                    .value=\${this._settings.url}
                    @change=\${(e) => (this._settings.url = e.target.value)}
                ></uix-input>
                 <uix-input
                    label="Theme Color"
                    type="color" 
                    .value=\${this._settings.theme_color}
                    @change=\${(e) => (this._settings.theme_color = e.target.value)}
                ></uix-input>
                <uix-input
                    class="md:col-span-2"
                    label="Open Graph Image URL"
                    .value=\${this._settings.og_image}
                    @change=\${(e) => (this._settings.og_image = e.target.value)}
                ></uix-input>
                <uix-input
                    class="md:col-span-2"
                    type="textarea"
                    label="Description"
                    .value=\${this._settings.description}
                    @change=\${(e) => (this._settings.description = e.target.value)}
                ></uix-input>
            </div>
            <div class="flex justify-end">
                <uix-button
                    @click=\${this.handleSave.bind(this)}
                    label="Save Settings"
                ></uix-button>
            </div>
        \`;
		},
	});

	return {
		tag: "bundler-ui",
		class: "flex flex-col gap-6 p-6 bg-gray-50 min-h-screen",
		render() {
			return html\`
            <h1 class="text-4xl font-extrabold text-gray-900">Release Manager</h1>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="flex flex-col gap-6">
                    <settings-editor></settings-editor> 
                    <credentials-manager
                        ._data=\${{ model: "credentials", id: "singleton", key: "row" }}
                    ></credentials-manager>
                    <release-creator></release-creator>
                </div>
                <release-history
                    ._data=\${{ model: "releases", order: "-deployedAt", key: "rows" }}
                ></release-history>
            </div>
        \`;
		},
	};
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/uix/layout/list.js":{content:`export default ({ T }) => ({
	tag: "uix-list",
	style: true,
	properties: {
		multiple: T.boolean(),
		multipleWithCtrl: T.boolean(),
		multipleWithShift: T.boolean(),
		lastSelectedIndex: T.number(),
		selectedIds: T.array(),
		onSelectedChanged: T.function(),
		gap: T.string({ defaultValue: "md" }),
		itemId: T.string(".uix-link"),
		selectable: T.boolean(),
	},
	connected() {
		if (this.selectable)
			this.addEventListener("click", this.handleClick.bind(this));
	},
	disconnected() {
		if (this.selectable)
			this.removeEventListener("click", this.handleClick.bind(this));
	},
	handleClick: function (e) {
		const link = e.target.closest(".uix-link");
		if (!link || !this.contains(link)) return;
		e.preventDefault();
		const links = Array.from(this.qa(".uix-link"));
		const index = links.indexOf(link);
		if (index === -1) return;
		if (
			this.multipleWithShift &&
			e.shiftKey &&
			this.lastSelectedIndex !== null
		) {
			const start = Math.min(this.lastSelectedIndex, index);
			const end = Math.max(this.lastSelectedIndex, index);
			links
				.slice(start, end + 1)
				.forEach((el) => el.setAttribute("selected", ""));
			this.lastSelectedIndex = index;
			this.updateSelectedIds();
			return;
		}
		if (this.multipleWithCtrl) {
			if (e.ctrlKey) {
				link.hasAttribute("selected")
					? link.removeAttribute("selected")
					: link.setAttribute("selected", "");
				this.lastSelectedIndex = index;
				this.updateSelectedIds();
				return;
			}
			links.forEach((el) => el.removeAttribute("selected"));
			if (link.hasAttribute("selected")) {
				link.removeAttribute("selected");
				this.lastSelectedIndex = null;
			} else {
				link.setAttribute("selected", "");
				this.lastSelectedIndex = index;
			}
			this.updateSelectedIds();
			return;
		}

		if (this.multiple) {
			link.hasAttribute("selected")
				? link.removeAttribute("selected")
				: link.setAttribute("selected", "");
			this.lastSelectedIndex = index;
			this.updateSelectedIds();
			return;
		}

		if (link.hasAttribute("selected")) {
			links.forEach((el) => el.removeAttribute("selected"));
			this.lastSelectedIndex = null;
		} else {
			links.forEach((el) => el.removeAttribute("selected"));
			link.setAttribute("selected", "");
			this.lastSelectedIndex = index;
		}
		this.updateSelectedIds();
	},
	updateSelectedIds() {
		const links = Array.from(this.qa(this.itemId));
		this.selectedIds = links.reduce((ids, el, index) => {
			if (el.hasAttribute("selected")) ids.push(index);
			return ids;
		}, []);
		if (this.onSelectedChanged) this.onSelectedChanged(this.selectedIds);
	},
});
`,mimeType:"application/javascript",skipSW:!1},"/modules/uix/display/link.js":{content:`export default ({ T, html, Router }) => ({
	tag: "uix-link",
	style: true,
	properties: {
		content: T.object(),
		context: T.object(),
		external: T.boolean(),
		selectable: T.boolean(),
		skipRoute: T.boolean(),
		hideLabel: T.boolean(),
		accordion: T.boolean(),
		float: T.object(),
		tab: T.boolean(),
		tooltip: T.boolean(),
		dropdown: T.boolean(),
		direction: T.string(),
		name: T.string(),
		alt: T.string(),
		label: T.string(),
		type: T.string(),
		href: T.string(),
		related: T.string(),
		icon: T.string(),
		active: T.boolean(),
		reverse: T.boolean(),
		vertical: T.boolean(),
		selected: T.boolean(),
		floatOpen: T.boolean(),
		click: T.function(),
		confirmation: T.string(),
	},

	connected() {
		this.boundHandleOutsideClick = this.handleOutsideClick.bind(this);
		this.boundHandleEscKey = this.handleEscKey.bind(this);

		if (this.context) {
			this.addEventListener("contextmenu", this.handleContextMenu);
		}
	},

	disconnected() {
		// --- REFACTOR: Clean up all listeners on disconnect.
		this.removeEventListener("contextmenu", this.handleContextMenu);
		this._removeGlobalListeners();
	},

	// --- NEW: Helper method to add global listeners.
	_addGlobalListeners() {
		// Use a slight delay to prevent the same click that opened the popup from closing it.
		setTimeout(() => {
			document.addEventListener("click", this.boundHandleOutsideClick);
			document.addEventListener("keydown", this.boundHandleEscKey);
		}, 0);
	},

	// --- NEW: Helper method to remove global listeners.
	_removeGlobalListeners() {
		document.removeEventListener("click", this.boundHandleOutsideClick);
		document.removeEventListener("keydown", this.boundHandleEscKey);
	},

	// --- NEW: A single method to close all popups and clean up listeners.
	closeAllPopups() {
		let wasOpen = false;
		if (this.hasAttribute("selected")) {
			this.removeAttribute("selected");
			wasOpen = true;
		}
		const contextContainer = this.q("[context]");
		if (contextContainer?.hasAttribute("open")) {
			contextContainer.removeAttribute("open");
			wasOpen = true;
		}
		if (this.hasAttribute("floatOpen")) {
			this.removeAttribute("floatOpen");
			wasOpen = true;
		}

		// Only remove listeners if something was actually closed.
		if (wasOpen) {
			this._removeGlobalListeners();
		}
	},

	defaultOnClick(e) {
		if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
			return;
		}
		const link = e.currentTarget;
		const localLink =
			this.href && link.origin === window.location.origin && !this.external;
		const isComponent = this.dropdown || this.accordion || this.tab;

		if (!this.href || localLink || isComponent || this.float) {
			e.preventDefault();
		}

		if (this.float) {
			this.toggleAttribute("floatOpen");
			// --- REFACTOR: Use helpers to manage listeners.
			this.hasAttribute("floatOpen")
				? this._addGlobalListeners()
				: this._removeGlobalListeners();
			return;
		}
		if (localLink && !this.skipRoute) {
			const path = [link.pathname, link.search].filter(Boolean).join("");
			isComponent ? Router.push(path) : Router.go(path);
			return;
		}

		if (this.click && this.type !== "submit") {
			if (this.confirmation) {
				if (window.confirm(this.confirmation)) {
					this.click(e);
				}
			} else {
				this.click(e);
			}
			e.stopImmediatePropagation();
		}

		if (this.dropdown) {
			this.toggleAttribute("selected");
			this.hasAttribute("selected")
				? this._addGlobalListeners()
				: this._removeGlobalListeners();
		}
	},

	handleContextMenu(e) {
		e.preventDefault();
		const contextContainer = this.q("[context]");
		if (contextContainer) {
			contextContainer.toggleAttribute("open");
			// --- REFACTOR: Use helpers to manage listeners.
			contextContainer.hasAttribute("open")
				? this._addGlobalListeners()
				: this._removeGlobalListeners();
		}
	},

	// --- REFACTOR: Simplified outside click handler.
	handleOutsideClick(e) {
		// If the click is outside the component OR on a link inside a popup, close everything.
		const isLinkInsidePopup =
			this.q("[dropdown], [context], [float]")?.contains(e.target) &&
			e.target.closest("a");

		if (!this.contains(e.target) || isLinkInsidePopup) {
			this.closeAllPopups();
		}
	},

	// --- REFACTOR: Simplified escape key handler.
	handleEscKey(e) {
		if (e.key === "Escape") {
			e.preventDefault();
			this.closeAllPopups();
		}
	},

	render() {
		// The render method remains the same.
		return html\`<a
            class=\${this.icon ? "uix-text-icon__element" : undefined}
            content
            href=\${this.href}
            @click=\${this.defaultOnClick.bind(this)}
            related=\${this.related}
            name=\${this.name || this.label || this.alt}
            alt=\${this.alt || this.label || this.name}
        >
            \${
							this.icon
								? html\`<uix-icon
                          name=\${this.icon}
                          alt=\${this.alt || this.label || this.name}
                          size=\${this.iconSize || this.size}
                      ></uix-icon>\`
								: ""
						}
            \${this.hideLabel ? null : this.label}
        </a>
        \${!this.dropdown ? null : html\`<div dropdown>\${this.dropdown}</div>\`}
        \${!this.context ? null : html\`<div context>\${this.context}</div>\`}
        \${!this.accordion ? null : html\`<div accordion>\${this.accordion}</div>\`}
        \${
					!this.tooltip
						? null
						: html\`<div tooltip>\${this.tooltip === true ? this.label : this.tooltip}</div>\`
				}
        \${!this.float ? null : html\`<div float>\${this.float}</div>\`}
    \`;
	},
});
`,mimeType:"application/javascript",skipSW:!1},"/modules/uix/form/input.js":{content:`import { ifDefined } from "/modules/mvc/view/html/directive.js";

const inputTypes = { string: "text" };
let uniqueIdCounter = 0;

export default ({ T, html }) => ({
	tag: "uix-input",
	style: true,
	properties: {
		bind: T.object({ attribute: false }),
		autofocus: T.boolean(),
		value: T.string(),
		placeholder: T.string(),
		name: T.string(),
		label: T.string(),
		disabled: T.boolean(),
		required: T.boolean(),
		type: T.string({
			defaultValue: "text",
			enum: [
				"text",
				"textarea",
				"select",
				"password",
				"email",
				"number",
				"decimal",
				"search",
				"tel",
				"url",
				"checkbox",
				"radio",
			],
		}),
		options: T.array({ defaultValue: [] }),
		checked: T.boolean(),
		selected: T.boolean(),
		regex: T.string(),
		maxLength: T.string(),
		rows: T.number({ defaultValue: 4 }),
		keydown: T.function(),
		input: T.function(),
		icon: T.string(),
	},
	formAssociated: true,
	formResetCallback() {
		const $input = this.getInput();
		if (!$input) return;
		if (!["submit", "button", "reset"].includes($input.type))
			$input.value = this._defaultValue || "";
		if (["radio", "checkbox", "switch"].includes($input.type))
			$input.checked = this._defaultValue || false;
		this.value = this.isCheckable ? $input.checked : $input.value;
		this._updateHasValue();
	},
	formDisabledCallback(disabled) {
		const $input = this.getInput();
		if ($input) $input.disabled = disabled;
	},
	formStateRestoreCallback(state) {
		const $input = this.getInput();
		if ($input) $input.value = state;
		this.value = state;
		this._updateHasValue();
	},
	reportValidity() {
		const $input = this.getInput();
		if (!$input) return true;
		const validity = $input.reportValidity() !== false;
		$input?.classList.toggle("input-error", !validity);
		return validity;
	},
	getInput() {
		if (!this.$input) {
			this.$input = this.querySelector("input, select, textarea");
			if (this.$input) {
				this._internals.setValidity(
					this.$input.validity,
					this.$input.validationMessage,
					this.$input,
				);
			}
		}
		return this.$input;
	},
	connected() {
		this._internals = this.attachInternals();
		this.fieldId = \`uix-input-\${++uniqueIdCounter}\`;
		this.isCheckable = this.type === "checkbox" || this.type === "radio";

		if (!this.name) {
			this.name = this.label
				? \`uix-input-\${this.label.toLowerCase().replace(/\\s+/g, "-")}\`
				: this.fieldId;
		}
		this.placeholder = this.placeholder || " ";
		if (this.bind) {
			this.value = this.bind.value;
			if (this.bind.instance) {
				this.bind.instance.on(\`\${this.bind.prop}Changed\`, ({ value }) => {
					this.setValue(value);
				});
			}
		}
		this._updateHasValue();
	},
	_updateHasValue() {
		if (this.isCheckable) {
			this.classList.remove("has-value");
			return;
		}
		const hasValue =
			this.value !== null && this.value !== undefined && this.value !== "";
		this.classList.toggle("has-value", hasValue);
	},
	_onInput(event) {
		const { target } = event;
		const newValue = this.isCheckable ? target.checked : target.value;

		if (this.value !== newValue) {
			this.value = newValue;
			this._updateHasValue();
			if (this.bind) this.bind.setValue(this.value);
			if (this.input) this.input(event);
		}
	},
	inputValue() {
		const el = this.getInput();
		return el ? (this.isCheckable ? el.checked : el.value) : undefined;
	},
	setValue(value) {
		const el = this.getInput();
		if (el) {
			if (this.isCheckable) el.checked = !!value;
			else el.value = value;
		}
		if (this.bind) this.bind.value = value;
		this.value = value;
		this._updateHasValue();
		this.requestUpdate();
	},
	resetValue() {
		const el = this.getInput();
		if (el) {
			if (this.isCheckable) el.checked = false;
			else el.value = "";
		}
		this.value = this.isCheckable ? false : "";
		if (this.bind) this.bind.value = this.value;
		this._updateHasValue();
		this.requestUpdate();
	},
	render() {
		const {
			fieldId,
			name,
			type,
			label,
			value = "",
			placeholder,
			rows,
			regex,
			autofocus,
			required,
			disabled,
			maxLength,
			keydown,
			icon,
			options,
		} = this;
		let fieldTemplate;
		switch (type) {
			case "textarea":
				fieldTemplate = html\`
                    <textarea
                        id=\${fieldId}
                        name=\${name}
                        placeholder=\${ifDefined(placeholder)}
                        ?autofocus=\${autofocus}
                        ?disabled=\${disabled}
                        ?required=\${required}
                        maxLength=\${ifDefined(maxLength)}
                        @input=\${this._onInput.bind(this)}
                        @keydown=\${ifDefined(keydown)}
                        rows=\${rows}
                    >\${value}</textarea>\`;
				break;

			case "select":
				fieldTemplate = html\`
									<div class="select-container">
											<select
												id=\${fieldId}
												name=\${name}
												value=\${value}
												?disabled=\${disabled}
												?required=\${required}
												?autofocus=\${autofocus}
												@change=\${this._onInput.bind(this)}>
													\${placeholder && !value ? html\`<option value="" disabled selected hidden>\${placeholder}</option>\` : ""}
													\${options.map(
														(option) => html\`
															<option value=\${option.value ?? option} ?selected=\${(option.value ?? option) === this.value}>
																	\${option.label ?? option}
															</option>
													\`,
													)}
											</select>
											<uix-icon name="chevron-down" class="select-arrow"></uix-icon>
										</div>
										\`;
				break;

			default:
				fieldTemplate = html\`
                    <input
                        id=\${fieldId}
                        name=\${name}
                        type=\${inputTypes[type] || type}
                        .value=\${value}
                        placeholder=\${ifDefined(placeholder)}
                        ?autofocus=\${autofocus}
                        maxLength=\${ifDefined(maxLength)}
                        @input=\${this._onInput.bind(this)}
                        @keydown=\${ifDefined(keydown)}
                        ?disabled=\${disabled}
                        ?required=\${required}
                        pattern=\${ifDefined(regex)}
                        ?checked=\${this.isCheckable && !!this.value}
                    />\`;
				break;
		}

		return html\`
            \${label ? html\`<label for=\${fieldId} ?required=\${required}>\${label}</label>\` : ""}
            \${fieldTemplate}
            \${icon ? html\`<uix-icon name=\${icon} class="input-icon"></uix-icon>\` : ""}
        \`;
	},
});
`,mimeType:"application/javascript",skipSW:!1},"/modules/uix/layout/list.css":{content:`.uix-list {
	display: flex;
	&[vertical] {
		flex-direction: column;
	}
}
`,mimeType:"text/css",skipSW:!1},"/modules/uix/navigation/navbar.css":{content:`.uix-navbar {
	--uix-navbar-text-color: var(--color-default-90);
	--uix-navbar-hover-text-color: var(--color-surface-80);
	--uix-navbar-border-radius: 0px;
	--uix-navbar-border-color: var(--color-default-60);
	--uix-navbar-border-size: 1px;
	--uix-navbar-border-style: solid;
	--uix-navbar-hover-background-color: var(--color-default-40);
	--uix-container-position: var(--uix-navbar-position);
	display: flex;
	flex-direction: column;
	&[docked] {
		--uix-list-button-radius: 0;
		border-bottom: 0;
		position: fixed;
		bottom: 0px;
		background-color: var(--uix-navbar-background-color, var(--color-default-5));
		> * {
			border-right: 0;
			border-bottom: 0;
			&:first-child {
				border-left: 0;
			}
		}
	}
}
`,mimeType:"text/css",skipSW:!1},"/modules/uix/display/link.css":{content:`:where(.uix-link) {
	font-weight: var(--uix-link-font-weight, 600);
	width: var(--uix-link-width, auto);
	color: var(--uix-link-text-color, var(--colors-default-900));
	--uix-link-indent: 0;
	cursor: pointer;

	&[vertical] {
		margin: 0 auto;
	}
	a,
	button {
		width: inherit;
		cursor: pointer;
		padding: var(--uix-link-padding);
		&:hover {
			color: var(--uix-link-hover-color, var(--uix-link-text-color));
		}
	}
	.uix-text-icon__element {
		display: flex;
		align-items: center;
		gap: var(--uix-link-icon-gap, 0.5rem);
		&[reverse][vertical] {
			flex-direction: column-reverse;
		}

		&:not([reverse])[vertical] {
			flex-direction: column;
		}

		&[reverse]:not([vertical]) {
			flex-direction: row-reverse;
		}

		&:not([reverse]):not([vertical]) {
			flex-direction: row;
		}
	}
	transition: all 0.3s ease-in-out;

	&[indent] {
		> a,
		> button {
			padding-left: var(--uix-link-indent);
		}
	}

	&[active]:hover {
		color: var(--uix-link-hover-text-color, var(--colors-primary-400));
	}

	&[selectable][selected] {
		background-color: var(--colors-primary-400);
	}

	&:hover {
		[tooltip] {
			display: flex;
		}
	}

	&[tooltip] {
		display: inline-block;
		&:hover {
			[tooltip] {
				visibility: visible;
			}
		}
		[tooltip] {
			visibility: hidden;
			width: 120px;
			background-color: black;
			color: #fff;
			text-align: center;
			border-radius: 6px;
			padding: 5px 10px;
			margin-left: 3px;
			position: absolute;
			z-index: 1000000000;
			top: 50%;
			left: 100%;
			transform: translateY(-50%);
		}
	}

	&[position~="top"] [tooltip] {
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
	}

	&[position~="bottom"] [tooltip] {
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
	}

	&[position~="left"] [tooltip] {
		top: 50%;
		right: 100%;
		transform: translateY(-50%);
	}

	&[tooltip],
	&[dropdown],
	&[context],
	&[float] {
		position: relative;
	}

	&[dropdown],
	&[accordion] {
		flex-direction: column;
	}

	[float],
	[dropdown],
	[accordion],
	[context] {
		display: none;
	}
	&[floatopen] > a {
		display: none;
	}
	&[floatopen] [float] {
		display: block;
		position: relative;
		bottom: 0px;
		right: 0px;
	}

	&[context] {
		z-index: auto;
	}
	[context][open] {
		display: flex;
		flex-direction: column;
	}
	[dropdown],
	[context][open] {
		position: absolute;
		left: 0;
		top: 100%;
		width: 100%;
		min-width: 200px;
		z-index: 1000;
		background-color: var(--colors-primary-100);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
		.uix-link:hover,
		input {
			background-color: var(--colors-primary-200);
		}
		& > .uix-link {
			width: 100%;
		}
	}

	[context][open] {
		display: flex;
	}

	&[selected] {
		[dropdown],
		[accordion] {
			display: flex;
			flex-direction: column;
		}
	}
}
`,mimeType:"text/css",skipSW:!1},"/modules/uix/display/button.css":{content:`:where(.uix-button) {
	border: var(--uix-button-borderSize, 0) solid var(--uix-button-borderColor);
	border-radius: var(--uix-button-borderRadius, var(--radius-md));
	box-shadow: var(--uix-button-shadow);
	width: var(--uix-button-width);
	min-width: fit-content;
	background-color: var(--uix-button-backgroundColor, black);
	color: var(--uix-button-textColor, var(--colors-default-100));
	font-weight: var(--uix-button-fontWeight, 700);
	display: flex;
	text-align: center;
	transition:
		transform 0.2s ease-in-out,
		opacity 0.2s ease-in-out,
		background-color 0.2s ease-in-out;
	&:hover {
		opacity: var(--uix-button-hover-opacity, 0.4);
	}

	&:active {
		transform: scale(0.97);
	}

	> button,
	> a,
	> input {
		width: max-content;
		display: block;
		border-radius: inherit;
		cursor: var(--uix-button-cursor, pointer);
		height: calc(var(--spacing) * 10);
		line-height: calc(var(--spacing) * 5);
		padding: var(
			--uix-button-padding,
			calc(var(--spacing) * 2.5) calc(var(--spacing) * 4)
		);
		word-break: keep-all;
		flex-basis: 100%;
	}

	.uix-icon,
	button,
	input,
	a {
		cursor: pointer;
	}

	&[bordered] {
		--uix-button-border-size: 1px;
		--uix-button-backgroundColor: transparent;
		--uix-button-hoverBackgroundColor: var(--_variant-color-300);
		--uix-button-borderColor: var(--_variant-color-400);
		--uix-button-textColor: var(--_variant-color-700);
	}

	&[ghost] {
		--uix-button-backgroundColor: transparent;
		--uix-button-hoverBackgroundColor: var(--_variant-color-300);
		--uix-button-borderSize: 0px;
		--uix-button-textColor: var(--_variant-color-700);
	}

	&[outline] {
		--uix-button-backgroundColor: transparent;
		--uix-button-hoverBackgroundColor: var(--_variant-color-300);
		--uix-button-textColor: var(--_variant-color-800);
		--uix-button-borderSize: 1px;
		--uix-button-borderColor: var(--_variant-color-400);
	}

	&[float] {
		background-color: black;
		--uix-button-hoverBackgroundColor: var(--_variant-color-500);
		--uix-button-textColor: var(--_variant-color-50);
		--uix-button-borderSize: 0px;
		--uix-button-borderRadius: 9999px;
		--uix-button-width: var(--uix-button-height);
		box-shadow: var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
		--uix-button-padding: 0.5rem;
	}
	&[float]:hover {
		box-shadow: var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
	}
}
`,mimeType:"text/css",skipSW:!1},"/modules/uix/display/icon.js":{content:`export default ({ T, html, $APP, Icons, theme }) => ({
	tag: "uix-icon",
	style: true,
	properties: {
		name: T.string(),
		svg: T.string(),
		solid: T.boolean(),
	},

	async getIcon(name) {
		if (Icons.has(name)) this.svg = Icons.get(name);
		else {
			try {
				const response = await fetch(
					$APP.fs.getFilePath(
						\`modules/icon-\${theme.font.icon.family}/\${theme.font.icon.family}/\${name}.svg\`,
					),
				);
				if (response.ok) {
					const svgElement = await response.text();
					Icons.set(name, svgElement);
					this.svg = svgElement;
				} else {
					console.error(\`Failed to fetch icon: \${name}\`);
				}
			} catch (error) {
				console.error(\`Error fetching icon: \${name}\`, error);
			}
		}
	},
	willUpdate() {
		if (this.name) {
			this.getIcon(this.name);
		}
	},
	render() {
		return !this.svg ? null : html.unsafeHTML(this.svg);
	},
});
`,mimeType:"application/javascript",skipSW:!1},"/modules/mvc/view/html/directive.js":{content:`/**
 * Creates a user-facing directive function from a Directive class. This
 * function has the same parameters as the directive's render() method.
 */
export const directive =
	(c) =>
	(...values) => ({
		// This property needs to remain unminified.
		["_$litDirective$"]: c,
		values,
	});

/**
 * Base class for creating custom directives. Users should extend this class,
 * implement \`render\` and/or \`update\`, and then pass their subclass to
 * \`directive\`.
 */
export class Directive {
	//@internal
	__part;
	//@internal
	__attributeIndex;
	//@internal
	__directive;
	//@internal
	_$parent;

	// These will only exist on the AsyncDirective subclass
	//@internal
	_$disconnectableChildren;
	// This property needs to remain unminified.
	//@internal
	["_$notifyDirectiveConnectionChanged"];

	constructor(_partInfo) {}

	// See comment in Disconnectable interface for why this is a getter
	get _$isConnected() {
		return this._$parent._$isConnected;
	}

	/** @internal */
	_$initialize(part, parent, attributeIndex) {
		this.__part = part;
		this._$parent = parent;
		this.__attributeIndex = attributeIndex;
	}
	/** @internal */
	_$resolve(part, props) {
		return this.update(part, props);
	}

	render(...props) {
		throw new Error("The \`render()\` method must be implemented.");
	}

	update(_part, props) {
		return this.render(...props);
	}
}

// A sentinel value that can never appear as a part value except when set by
// live(). Used to force a dirty-check to fail and cause a re-render.
const RESET_VALUE = {};

/**
 * Sets the committed value of a ChildPart directly without triggering the
 * commit stage of the part.
 *
 * This is useful in cases where a directive needs to update the part such
 * that the next update detects a value change or not. When value is omitted,
 * the next update will be guaranteed to be detected as a change.
 *
 * @param part
 * @param value
 */
const setCommittedValue = (part, value = RESET_VALUE) =>
	(part._$committedValue = value);
const nothing = Symbol.for("lit-nothing");
class Keyed extends Directive {
	key = nothing;
	render(k, v) {
		this.key = k;
		return v;
	}
	update(part, [k, v]) {
		if (k !== this.key) {
			// Clear the part before returning a value. The one-arg form of
			// setCommittedValue sets the value to a sentinel which forces a
			// commit the next render.
			setCommittedValue(part);
			this.key = k;
		}
		return v;
	}
}

export const keyed = directive(Keyed);

export const ifDefined = (value) => value ?? nothing;
`,mimeType:"application/javascript",skipSW:!1},"/modules/uix/display/icon.css":{content:`.uix-icon {
	display: inline-block;
	vertical-align: middle;
	svg {
		height: inherit;
		width: inherit;
	}
}

&[solid] {
	stroke: currentColor;
	fill: currentColor;
}
`,mimeType:"text/css",skipSW:!1},"/modules/uix/form/input.css":{content:`:where(.uix-input) {
	--uix-input-background-color: var(--colors-surface-100);
	--uix-input-border-color: var(--colors-gray-900);
	--uix-input-text-color: var(--colors-gray-900);
	--uix-input-placeholder-color: var(--colors-default-500);
	--uix-input-border-radius: var(--border-radius-md);
	--uix-input-border-width: 2px;
	--uix-input-padding-x: calc(var(--spacing) * 4);
	--uix-input-padding-y: calc(var(--spacing) * 2.5);
	--uix-input-font-size: var(--font-size-base);
	--uix-input-height: 2.5rem;
	--uix-input-disabled-opacity: 0.6;
	--uix-input-label-font-size: var(--font-size-sm);
	--uix-input-label-font-weight: var(--font-weight-bold);
	--uix-input-label-color: var(--colors-default-700);
	--uix-input-checkbox-size: 1.5rem;
	--uix-input-checkbox-border-radius: var(--border-radius-sm);
	--uix-input-checkbox-checked-bg: var(--colors-primary-600);
	--uix-input-checkbox-check-color: var(--colors-surface-100);
	width: 100%;
	display: flex;
	flex-direction: column;

	input,
	select,
	textarea {
		width: 100%;
		height: var(--uix-input-height);
		border-radius: var(--uix-input-border-radius);
		border: var(--uix-input-border-width) solid var(--uix-input-border-color);
		font-size: var(--uix-input-font-size);
		background-color: var(--uix-input-background-color);
		color: var(--uix-input-text-color);
		transition: var(--uix-transition);
		outline: none;
		padding: var(--uix-input-padding-y) var(--uix-input-padding-x);
	}

	textarea {
		resize: vertical;
	}

	&:has(textarea) {
		height: auto;
	}

	select {
		appearance: none;
		-webkit-appearance: none;
		cursor: pointer;
		font-weight: 600;
		padding-block: 0;
		option {
			font-weight: 600;
			background-color: var(--uix-input-background-color);
			font-size: 1.1rem;
			line-height: 1.5rem;
			color: #333;
			padding: 50px;
			border: 2px solid red;
		}
	}

	.select-container {
		position: relative;
		.select-arrow {
			position: absolute;
			right: calc(2 * var(--spacing));
		}
	}

	input::placeholder {
		color: transparent;
	}

	label {
		font-weight: var(--uix-input-label-font-weight);
		color: var(--uix-input-label-color, var(--colors-gray-600));
		margin-bottom: var(--spacing);
		font-size: 0.9rem;
		padding: 0 4px;
		transition: all 0.2s ease-in-out;
		pointer-events: none;
		&[required]::after {
			content: "*";
			color: var(--colors-danger-500);
			margin-left: 2px;
		}
	}

	/* Floating label logic */
	input:not(:placeholder-shown) + label,
	textarea:not(:placeholder-shown) + label,
	&:focus-within label,
	&.has-value label {
		top: -2px;
		transform: translateY(0);
		font-size: var(--uix-input-label-font-size);
	}
	&:focus-within input,
	&:focus-within select,
	&:focus-within textarea {
		box-shadow: 0 0 var(--uix-input-focus-ring-width, 5px)
			var(--uix-input-focus-ring-color, rgba(0, 0, 255, 0.5));
	}

	&[disabled] {
		cursor: not-allowed;
		opacity: var(--uix-input-disabled-opacity);

		& label {
			cursor: not-allowed;
		}
	}

	.input-icon,
	.select-arrow {
		position: absolute;
		top: 50%;
		right: var(--spacing);
		transform: translateY(-50%);
		pointer-events: none;
		color: var(--uix-input-label-color);
		transition: transform 0.2s ease-in-out;
	}

	&:has(select:hover:active) .select-arrow {
		transform: translateY(-50%) rotate(180deg);
	}

	&:has(.input-icon:not(.select-arrow)) > input {
		padding-right: calc(var(--uix-input-padding-x) + 1.75em);
	}

	&[type="checkbox"],
	&[type="radio"] {
		flex-direction: row;
		align-items: center;
		border: 0;
		height: auto;
		width: auto;
		background-color: transparent;
		box-shadow: none;
		gap: 0.75rem;
		cursor: pointer;
		label {
			margin: 0;
			line-height: 1.5rem;
			position: static;
			transform: none;
			background-color: transparent;
			padding: 0;
			cursor: pointer;
			font-weight: var(--font-weight-normal);
			order: 2;
			pointer-events: auto;
		}

		input {
			appearance: none;
			-webkit-appearance: none;
			width: var(--uix-input-checkbox-size);
			height: var(--uix-input-checkbox-size);
			margin: 0;
			border: var(--uix-input-border-width) solid var(--uix-input-border-color);
			background-color: var(--uix-input-background-color);
			cursor: pointer;
			position: relative;
			transition: var(--uix-transition);
			padding: 0;

			&::after {
				content: "";
				position: absolute;
				display: none;
				left: 50%;
				top: 50%;
			}

			&:checked {
				background-color: var(--uix-input-checkbox-checked-bg);
				border-color: var(--uix-input-checkbox-checked-bg);
				&::after {
					display: block;
				}
			}

			&:focus-visible {
				box-shadow: 0 0 0 var(--uix-input-focus-ring-width)
					var(--uix-input-focus-ring-color);
				border-color: var(--uix-input-focus-ring-color);
			}
		}
	}

	&[type="checkbox"] input::after {
		width: 0.375rem;
		height: 0.75rem;
		border: solid var(--uix-input-checkbox-check-color);
		border-width: 0 2px 2px 0;
		transform: translate(-50%, -60%) rotate(45deg);
	}

	&[type="radio"] input {
		border-radius: var(--border-radius-full);
		&::after {
			width: calc(var(--uix-input-checkbox-size) / 2);
			height: calc(var(--uix-input-checkbox-size) / 2);
			border-radius: var(--border-radius-full);
			background-color: var(--uix-input-checkbox-check-color);
			transform: translate(-50%, -50%);
		}
	}

	&[ghost] {
		&:focus-within select {
			box-shadow: none;
		}
		.select-arrow {
			margin-left: 5px;
			padding-left: 5px;
		}
		select {
			background: inherit;
			border: 0;
		}
	}
}
`,mimeType:"text/css",skipSW:!1},"/modules/icon-lucide/lucide/cog.svg":{content:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 20a8 8 0 1 0 0-16a8 8 0 0 0 0 16"/><path d="M12 14a2 2 0 1 0 0-4a2 2 0 0 0 0 4m0-12v2m0 18v-2m5 .66l-1-1.73m-5-8.66L7 3.34M20.66 17l-1.73-1M3.34 7l1.73 1M14 12h8M2 12h2m16.66-5l-1.73 1M3.34 17l1.73-1M17 3.34l-1 1.73m-5 8.66l-4 6.93"/></g></svg>',mimeType:"image/svg+xml",skipSW:!1},"/modules/icon-lucide/lucide/square-mouse-pointer.svg":{content:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z"/><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/></g></svg>',mimeType:"image/svg+xml",skipSW:!1},"/modules/icon-lucide/lucide/bot-message-square.svg":{content:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V2H8m0 16l-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Zm-6-6h2m5-1v2m6-2v2m5-1h2"/></svg>',mimeType:"image/svg+xml",skipSW:!1},"/modules/icon-lucide/lucide/server-cog.svg":{content:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M4.5 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-.5m-15 4H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-.5M6 6h.01M6 18h.01m9.69-4.6l-.9-.3m-5.6-2.2l-.9-.3m2.3 5.1l.3-.9m2.7.9l-.4-1m-2.4-5.4l-.4-1m-2.1 5.3l1-.4m5.4-2.4l1-.4m-2.3-2.1l-.3.9"/></g></svg>',mimeType:"image/svg+xml",skipSW:!1},"/modules/icon-lucide/lucide/sun.svg":{content:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></g></svg>',mimeType:"image/svg+xml",skipSW:!1},"/modules/icon-lucide/lucide/settings.svg":{content:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2"/><circle cx="12" cy="12" r="3"/></g></svg>',mimeType:"image/svg+xml",skipSW:!1},"/index.html":{content:`<!DOCTYPE html>
<html lang="en">
<head>
  <script type="importmap">
			{
				"imports": {
					"@modelcontextprotocol/sdk/": "https://cdn.jsdelivr.net/npm/@modelcontextprotocol/sdk@1.18.1/dist/esm/",
					"zod": "https://esm.sh/zod@3.23.8",
					"eventsource-parser/stream": "https://esm.sh/eventsource-parser/stream",
					"pkce-challenge": "https://esm.sh/pkce-challenge",
          "zod-to-json-schema": "https://esm.sh/zod-to-json-schema@3.24.5",          
					"ajv": "https://esm.sh/ajv@6.12.6"
				}
			}
		<\/script>
  <meta charset="utf-8" />
  <title>meetuprio</title>
  <base href="/" />
  
  <meta name="viewport"
    content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0" />
  <meta name="description" content="This is a meetuprio app" />
  <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#181818" />
  <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f3f3f3" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-title" content="meetuprio" />
  <meta name="mobile-web-app-status-bar-style" content="black" />
  <link id="favicon" rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLW1vdW50YWluIj48cGF0aCBkPSJtOCAzIDQgOCA1LTUgNSAxNUgyTDggM3oiLz48L3N2Zz4="/>
  <link rel="manifest" href="manifest.json" /> 
	<script>
		const ensureSWController = () => {
			const timeoutPromise = new Promise((_, reject) => {
				setTimeout(() => reject(new Error("Service Worker timed out.")), 100);
			});
			const controllerPromise = new Promise((resolve) => {
				if (navigator.serviceWorker.controller) {
					return resolve();
				}
				navigator.serviceWorker.addEventListener("controllerchange", () => {
					return resolve();
				});
			});
			return Promise.race([controllerPromise, timeoutPromise]);
		};
		const startApp = async () => {
			if (!("serviceWorker" in navigator)) {
				console.warn("Service Worker not supported.");
				throw new Error("Platform not supported");
			}
			await navigator.serviceWorker.register("/sw.js", {
				scope: "/",
				type: "module",
			});
			try {
				console.log("Waiting for Service Worker to take control...");
				await ensureSWController();
				console.log("\u2705 Service Worker is in control!");
				const { default: $APP } = await import("/bootstrap.js");
				await $APP.loadApp();
			} catch (error) {
				console.warn("Service Worker did not take control in time. Reloading...");
				window.location.reload();
			}
		};
		startApp();
	<\/script>
</head>
<body>
  <app-container></app-container>
</body>
</html>
`,mimeType:"text/html",skipSW:!1},"/package.json":{content:`{
	"name": "1kpushups",
	"version": "1",
	"dependencies": {
		"MVC": "/modules/mvc/index.js",
		"p2p": "/modules/p2p/index.js",
		"admin": "/modules/apps/admin/index.js",
		"uix": "/modules/uix/index.js",
		"icon-lucide": "/modules/icon-lucide/index.js"
	},
	"settings": {
		"name": "1k Pushups"
	},
	"theme": {
		"background": {
			"color": "#e7e5e4"
		},
		"font": {
			"family": "'Manrope'"
		}
	}
}
`,mimeType:"application/json",skipSW:!1},"/modules/mvc/index.js":{content:`export const dependencies = {
	fs: "/modules/mvc/helpers/filesystem.js",
	View: "/modules/mvc/view/index.js",
	ThemeManager: "/modules/theme/index.js",
	Loader: "/modules/mvc/view/loader.js",
	SW: "/modules/sw/index.js",
	Backend: "/modules/mvc/controller/backend/index.js",
	Model: "/modules/mvc/model/frontend.js",
	Controller: "/modules/mvc/controller/index.js",
	Router: "/modules/router/index.js",
	"user-frontend": "/index.js",
};

export default ({ $APP }) => {
	$APP.addModule({ name: "template", path: "views/templates", root: true });
	$APP.addModule({ name: "view", path: "views", root: true });
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/mvc/helpers/filesystem.js":{content:`export default ({ $APP }) => {
	$APP.addModule({ name: "fs" });
	const context = $APP.fs;

	const fs = {
		async import(path, { tag, module } = {}) {
			try {
				const content = await import(path);
				context[path] = {
					tag,
					path,
					module,
					extension: tag ? "component" : "js",
				};
				return content;
			} catch (err) {
				console.error(\`Failed to import \${path}:\`, err);
				return { error: true };
			}
		},
		async fetchResource(path, handleResponse, extension) {
			try {
				const response = await fetch(path);
				context[path] = {
					path,
					extension,
				};
				if (response.ok) return await handleResponse(response);
			} catch (error) {
				console.warn(\`Resource not found at: \${path}\`, error);
			}
			return null;
		},
		list() {
			const list = {};
			Object.values(context).forEach((file) => {
				const { extension } = file;
				if (!list[file.extension]) list[extension] = [];
				list[extension].push(file);
			});
			return list;
		},
		assets() {
			return Object.values(context).filter(
				({ extension }) => !["js", "component"].includes(extension),
			);
		},
		components() {
			return Object.values(context).filter(
				({ tag, extension }) => extension === "js" && !!tag,
			);
		},
		json(path) {
			return fs.fetchResource(path, (res) => res.json(), "json");
		},
		css: async (file, addToStyle = false) => {
			const cssContent = await fs.fetchResource(
				file,
				async (response) => await response.text(),
				"css",
			);
			if (!addToStyle) return cssContent;
			const style = document.createElement("style");
			style.textContent = cssContent;
			document.head.appendChild(style);
			return cssContent;
		},
		getFilePath(file) {
			if ($APP.settings.mv3Injected) return chrome.runtime.getURL(file);
			return \`\${$APP.settings.basePath}\${file.startsWith("/") ? file : \`/\${file}\`}\`;
		},
		getRequestPath(urlString) {
			const url = new URL(urlString);
			return url.pathname + url.search;
		},
	};
	return fs;
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/mvc/view/index.js":{content:`window.$ = (element) => document.querySelector(element);
window.$$ = (element) => document.querySelectorAll(element);

export const dependencies = {
	html: "/modules/mvc/view/html/index.js",
	T: "/modules/types/index.js",
};

export default ({ T, html }) => {
	const _data = T.object({
		properties: {
			model: T.string(),
			id: T.string(),
			method: T.string(),
			filter: T.object(),
			includes: T.string(),
			order: T.string(),
			limit: T.number(),
			offset: T.number(),
			count: T.number(),
		},
	});

	function addClassTags(instance, proto) {
		if (proto?.constructor) {
			addClassTags(instance, Object.getPrototypeOf(proto));
			if (proto.constructor.tag) {
				instance.classList.add(proto.constructor.tag);
			}
		}
	}

	class View extends HTMLElement {
		static get observedAttributes() {
			return Object.keys(this.properties).filter(
				(key) => this.properties[key].attribute !== false,
			);
		}

		static properties = { _data };
		static _attrs = {};
		static plugins = [];
		state = {};
		_hasUpdated = false;
		_ignoreAttributeChange = false;
		_changedProps = {};

		on(eventName, listener) {
			if (typeof listener !== "function") {
				console.error(
					\`Error adding listener to \${eventName}: callback is not a function.\`,
				);
				return;
			}
			listener.bind(this);
			const wrapper = ({ detail }) => listener(detail);
			this.addEventListener(eventName, wrapper);
			return wrapper;
		}

		off(eventName, listener) {
			this.removeEventListener(eventName, listener);
		}

		emit(eventName, data) {
			const event = new CustomEvent(eventName, {
				detail: data,
			});
			this.dispatchEvent(event);
		}

		connectedCallback() {
			if (this.constructor.properties) this.initProps();
			addClassTags(this, Object.getPrototypeOf(this));
			for (const plugin of this.constructor.plugins) {
				const { events } = plugin;
				Object.entries(events).map(
					([event, fn]) => fn && this.on(event, fn.bind(this)),
				);
			}
			this.emit("connected", {
				instance: this,
				component: this.constructor,
			});
			this.requestUpdate();
		}

		disconnectedCallback() {
			this.emit("disconnected", {
				instance: this,
				component: this.constructor,
			});
		}

		defer(fn) {
			requestAnimationFrame(fn.bind(this));
		}

		q(element) {
			return this.querySelector(element);
		}

		qa(element) {
			return this.querySelectorAll(element);
		}

		prop(prop) {
			return {
				value: this[prop],
				setValue: ((newValue) => (this[prop] = newValue)).bind(this),
				instance: this,
				prop,
			};
		}

		initProps() {
			for (const attr of this.attributes) {
				const key = this.constructor._attrs[attr.name];
				const prop = this.constructor.properties[key];
				if (prop && prop.type !== "boolean" && attr.value === "") {
					this.removeAttribute(attr.name);
					continue;
				}
				this.state[key] = prop
					? T.stringToType(attr.value, {
							...prop,
							attribute: true,
						})
					: attr.value;
			}
			for (const [key, prop] of Object.entries(this.constructor.properties)) {
				const {
					type,
					sync,
					defaultValue,
					attribute = true,
					setter,
					getter,
				} = prop;
				if (sync) continue;
				this.state[key] ??= this[key] ?? defaultValue;
				Object.defineProperty(this, key, {
					get: getter ? getter.bind(this) : () => this.state[key],
					set: setter
						? setter.bind(this)
						: (value) => {
								const oldValue = this.state[key];
								if (oldValue === value) return;
								this.state[key] = value;
								if (attribute)
									this.updateAttribute({
										key,
										value,
										skipPropUpdate: true,
										type,
									});
								this.requestUpdate(key, oldValue);
							},
				});

				const value = this.state[key];
				if (!attribute || this.hasAttribute(key) || value === undefined)
					continue;

				this.updateAttribute({
					key,
					value,
					skipPropUpdate: true,
					type,
				});

				this._changedProps[key] = undefined;
			}
		}

		requestUpdate(key, oldValue) {
			if (key) this._changedProps[key] = oldValue;
			if (this.updateComplete) clearTimeout(this.updateComplete);
			this.updateComplete = setTimeout(() => {
				this.performUpdate(key === undefined);
			}, 0);
			return this.updateComplete;
		}

		performUpdate(forceUpdate) {
			const changedProps = this._changedProps;
			this.updateComplete = null;
			if (this._hasUpdated && !forceUpdate && !this.shouldUpdate(changedProps))
				return;
			this.emit("willUpdate", changedProps);
			this.update(changedProps);
			if (!this._hasUpdated) {
				this._hasUpdated = true;
				this.emit("firstUpdated", changedProps);
			}
			this.emit("updated", changedProps);
			this._changedProps = {};
		}

		shouldUpdate(_changedProps) {
			const changedProps = { ..._changedProps };
			if (!this._hasUpdated) return true;
			for (const [key, oldValue] of Object.entries(changedProps)) {
				const newValue = this[key];
				const prop = this.constructor.properties[key];
				const hasChanged = prop?.hasChanged
					? prop.hasChanged(newValue, oldValue)
					: oldValue !== newValue;
				if (!hasChanged) delete changedProps[key];
				else
					this.emit(\`\${key}Changed\`, {
						oldValue,
						value: newValue,
						instance: this,
						component: this.constructor,
					});
			}
			this._changedProps = {};
			return Object.keys(changedProps).length > 0;
		}

		update() {
			html.render(this.render(), this);
		}

		render() {
			return null;
		}

		attributeChangedCallback(key, oldValue, value) {
			if (oldValue === value) return;
			this.emit("attributeChangedCallback", {
				instance: this,
				component: this.constructor,
				key,
				value,
				oldValue,
			});

			if (this._ignoreAttributeChange) return;
			this.state[key] = T.stringToType(value, this.constructor.properties[key]);
			if (this._hasUpdated) this.requestUpdate(key, oldValue);
		}

		updateAttribute({ key, value, type, skipPropUpdate = false }) {
			if (!type) return;
			this._ignoreAttributeChange = skipPropUpdate;
			if (type === "function" && typeof value === "function") {
				this.setAttribute(key, value.toString());
			} else if (type === "boolean") {
				if (value) this.setAttribute(key, "");
				else this.removeAttribute(key);
			} else {
				if (value === undefined) this.removeAttribute(key);
				else {
					if (["array", "object"].includes(type))
						this.setAttribute(key, JSON.stringify(value));
					else this.setAttribute(key, value);
				}
			}

			if (skipPropUpdate) this._ignoreAttributeChange = false;
			else this[key] = value;
		}
	}

	return View;
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/mvc/view/html/index.js":{content:`const DEV_MODE = false;
const ENABLE_EXTRA_SECURITY_HOOKS = false;
const ENABLE_SHADYDOM_NOPATCH = false;
const NODE_MODE = false;

// Allows minifiers to rename references to globalThis
const global = globalThis;

/**
 * Contains types that are part of the unstable debug API.
 *
 * Everything in this API is not stable and may change or be removed in the future,
 * even on patch releases.
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
let LitUnstable;
/**
 * Useful for visualizing and logging insights into what the Lit template system is doing.
 *
 * Compiled out of prod mode builds.
 */
const debugLogEvent = DEV_MODE
	? (event) => {
			const shouldEmit = global.emitLitDebugLogEvents;
			if (!shouldEmit) {
				return;
			}
			global.dispatchEvent(
				new CustomEvent("lit-debug", {
					detail: event,
				}),
			);
		}
	: undefined;
// Used for connecting beginRender and endRender events when there are nested
// renders when errors are thrown preventing an endRender event from being
// called.
let debugLogRenderId = 0;
let issueWarning;
if (DEV_MODE) {
	global.litIssuedWarnings ??= new Set();

	// Issue a warning, if we haven't already.
	issueWarning = (code, warning) => {
		warning += code
			? \` See https://lit.dev/msg/\${code} for more information.\`
			: "";
		if (!global.litIssuedWarnings.has(warning)) {
			console.warn(warning);
			global.litIssuedWarnings.add(warning);
		}
	};
	issueWarning(
		"dev-mode",
		"Lit is in dev mode. Not recommended for production!",
	);
}
const wrap =
	ENABLE_SHADYDOM_NOPATCH &&
	global.ShadyDOM?.inUse &&
	global.ShadyDOM?.noPatch === true
		? global.ShadyDOM.wrap
		: (node) => node;
const trustedTypes = global.trustedTypes;

/**
 * Our TrustedTypePolicy for HTML which is declared using the html template
 * tag function.
 *
 * That HTML is a developer-authored constant, and is parsed with innerHTML
 * before any untrusted expressions have been mixed in. Therefor it is
 * considered safe by construction.
 */
const policy = trustedTypes
	? trustedTypes.createPolicy("lit-html", {
			createHTML: (s) => s,
		})
	: undefined;

/**
 * Used to sanitize any value before it is written into the DOM. This can be
 * used to implement a security policy of allowed and disallowed values in
 * order to prevent XSS attacks.
 *
 * One way of using this callback would be to check attributes and properties
 * against a list of high risk fields, and require that values written to such
 * fields be instances of a class which is safe by construction. Closure's Safe
 * HTML Types is one implementation of this technique (
 * https://github.com/google/safe-html-types/blob/master/doc/safehtml-types.md).
 * The TrustedTypes polyfill in API-only mode could also be used as a basis
 * for this technique (https://github.com/WICG/trusted-types).
 *
 * @param node The HTML node (usually either a #text node or an Element) that
 *     is being written to. Note that this is just an exemplar node, the write
 *     may take place against another instance of the same class of node.
 * @param name The name of an attribute or property (for example, 'href').
 * @param type Indicates whether the write that's about to be performed will
 *     be to a property or a node.
 * @return A function that will sanitize this class of writes.
 */

/**
 * A function which can sanitize values that will be written to a specific kind
 * of DOM sink.
 *
 * See SanitizerFactory.
 *
 * @param value The value to sanitize. Will be the actual value passed into
 *     the lit-html template literal, so this could be of any type.
 * @return The value to write to the DOM. Usually the same as the input value,
 *     unless sanitization is needed.
 */

const identityFunction = (value) => value;
const noopSanitizer = (_node, _name, _type) => identityFunction;

/** Sets the global sanitizer factory. */
const setSanitizer = (newSanitizer) => {
	if (!ENABLE_EXTRA_SECURITY_HOOKS) {
		return;
	}
	if (sanitizerFactoryInternal !== noopSanitizer) {
		throw new Error(
			"Attempted to overwrite existing lit-html security policy." +
				" setSanitizeDOMValueFactory should be called at most once.",
		);
	}
	sanitizerFactoryInternal = newSanitizer;
};

/**
 * Only used in internal tests, not a part of the public API.
 */
const _testOnlyClearSanitizerFactoryDoNotCallOrElse = () => {
	sanitizerFactoryInternal = noopSanitizer;
};
const createSanitizer = (node, name, type) => {
	return sanitizerFactoryInternal(node, name, type);
};

// Added to an attribute name to mark the attribute as bound so we can find
// it easily.
const boundAttributeSuffix = "$lit$";

// This marker is used in many syntactic positions in HTML, so it must be
// a valid element name and attribute name. We don't support dynamic names (yet)
// but this at least ensures that the parse tree is closer to the template
// intention.
const marker = \`lit$\${Math.random().toFixed(9).slice(2)}$\`;

// String used to tell if a comment is a marker comment
const markerMatch = "?" + marker;

// Text used to insert a comment marker node. We use processing instruction
// syntax because it's slightly smaller, but parses as a comment node.
const nodeMarker = \`<\${markerMatch}>\`;
const d =
	NODE_MODE && global.document === undefined
		? {
				createTreeWalker() {
					return {};
				},
			}
		: document;

// Creates a dynamic marker. We never have to search for these in the DOM.
const createMarker = () => d.createComment("");

// https://tc39.github.io/ecma262/#sec-typeof-operator

const isPrimitive = (value) =>
	value === null || (typeof value != "object" && typeof value != "function");
const isArray = Array.isArray;
const isIterable = (value) =>
	isArray(value) ||
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	typeof value?.[Symbol.iterator] === "function";
const SPACE_CHAR = "[ \\t\\n\\f\\r]";
const ATTR_VALUE_CHAR = \`[^ \\t\\n\\f\\r"'\\\`<>=]\`;
const NAME_CHAR = \`[^\\\\s"'>=/]\`;

// These regexes represent the five parsing states that we care about in the
// Template's HTML scanner. They match the *end* of the state they're named
// after.
// Depending on the match, we transition to a new state. If there's no match,
// we stay in the same state.
// Note that the regexes are stateful. We utilize lastIndex and sync it
// across the multiple regexes used. In addition to the five regexes below
// we also dynamically create a regex to find the matching end tags for raw
// text elements.

/**
 * End of text is: \`<\` followed by:
 *   (comment start) or (tag) or (dynamic tag binding)
 */
const textEndRegex = /<(?:(!--|\\/[^a-zA-Z])|(\\/?[a-zA-Z][^>\\s]*)|(\\/?$))/g;
const COMMENT_START = 1;
const TAG_NAME = 2;
const DYNAMIC_TAG_NAME = 3;
const commentEndRegex = /-->/g;
/**
 * Comments not started with <!--, like </{, can be ended by a single \`>\`
 */
const comment2EndRegex = />/g;

/**
 * The tagEnd regex matches the end of the "inside an opening" tag syntax
 * position. It either matches a \`>\`, an attribute-like sequence, or the end
 * of the string after a space (attribute-name position ending).
 *
 * See attributes in the HTML spec:
 * https://www.w3.org/TR/html5/syntax.html#elements-attributes
 *
 * " \\t\\n\\f\\r" are HTML space characters:
 * https://infra.spec.whatwg.org/#ascii-whitespace
 *
 * So an attribute is:
 *  * The name: any character except a whitespace character, ("), ('), ">",
 *    "=", or "/". Note: this is different from the HTML spec which also excludes control characters.
 *  * Followed by zero or more space characters
 *  * Followed by "="
 *  * Followed by zero or more space characters
 *  * Followed by:
 *    * Any character except space, ('), ("), "<", ">", "=", (\`), or
 *    * (") then any non-("), or
 *    * (') then any non-(')
 */
const tagEndRegex = new RegExp(
	\`>|\${SPACE_CHAR}(?:(\${NAME_CHAR}+)(\${SPACE_CHAR}*=\${SPACE_CHAR}*(?:\${ATTR_VALUE_CHAR}|("|')|))|$)\`,
	"g",
);
const ENTIRE_MATCH = 0;
const ATTRIBUTE_NAME = 1;
const SPACES_AND_EQUALS = 2;
const QUOTE_CHAR = 3;
const singleQuoteAttrEndRegex = /'/g;
const doubleQuoteAttrEndRegex = /"/g;
/**
 * Matches the raw text elements.
 *
 * Comments are not parsed within raw text elements, so we need to search their
 * text content for marker strings.
 */
const rawTextElement = /^(?:script|style|textarea|title)$/i;

/** TemplateResult types */
const HTML_RESULT = 1;
const SVG_RESULT = 2;
const MATHML_RESULT = 3;
// TemplatePart types
// IMPORTANT: these must match the values in PartType
const ATTRIBUTE_PART = 1;
const CHILD_PART = 2;
const PROPERTY_PART = 3;
const BOOLEAN_ATTRIBUTE_PART = 4;
const EVENT_PART = 5;
const ELEMENT_PART = 6;
const COMMENT_PART = 7;

/**
 * The return type of the template tag functions, {@linkcode html} and
 * {@linkcode svg} when it hasn't been compiled by @lit-labs/compiler.
 *
 * A \`TemplateResult\` object holds all the information about a template
 * expression required to render it: the template strings, expression values,
 * and type of template (html or svg).
 *
 * \`TemplateResult\` objects do not create any DOM on their own. To create or
 * update DOM you need to render the \`TemplateResult\`. See
 * [Rendering](https://lit.dev/docs/components/rendering) for more information.
 *
 */

/**
 * This is a template result that may be either uncompiled or compiled.
 *
 * In the future, TemplateResult will be this type. If you want to explicitly
 * note that a template result is potentially compiled, you can reference this
 * type and it will continue to behave the same through the next major version
 * of Lit. This can be useful for code that wants to prepare for the next
 * major version of Lit.
 */

/**
 * The return type of the template tag functions, {@linkcode html} and
 * {@linkcode svg}.
 *
 * A \`TemplateResult\` object holds all the information about a template
 * expression required to render it: the template strings, expression values,
 * and type of template (html or svg).
 *
 * \`TemplateResult\` objects do not create any DOM on their own. To create or
 * update DOM you need to render the \`TemplateResult\`. See
 * [Rendering](https://lit.dev/docs/components/rendering) for more information.
 *
 * In Lit 4, this type will be an alias of
 * MaybeCompiledTemplateResult, so that code will get type errors if it assumes
 * that Lit templates are not compiled. When deliberately working with only
 * one, use either {@linkcode CompiledTemplateResult} or
 * {@linkcode UncompiledTemplateResult} explicitly.
 */

/**
 * A TemplateResult that has been compiled by @lit-labs/compiler, skipping the
 * prepare step.
 */

/**
 * Generates a template literal tag function that returns a TemplateResult with
 * the given result type.
 */
const tag =
	(type) =>
	(strings, ...values) => {
		// Warn against templates octal escape sequences
		// We do this here rather than in render so that the warning is closer to the
		// template definition.
		if (DEV_MODE && strings.some((s) => s === undefined)) {
			console.warn(
				"Some template strings are undefined.\\n" +
					"This is probably caused by illegal octal escape sequences.",
			);
		}
		if (DEV_MODE) {
			// Import static-html.js results in a circular dependency which g3 doesn't
			// handle. Instead we know that static values must have the field
			// \`_$litStatic$\`.
			if (values.some((val) => val?.["_$litStatic$"])) {
				issueWarning(
					"",
					\`Static values 'literal' or 'unsafeStatic' cannot be used as values to non-static templates.\\n\` +
						\`Please use the static 'html' tag function. See https://lit.dev/docs/templates/expressions/#static-expressions\`,
				);
			}
		}
		return {
			// This property needs to remain unminified.
			["_$litType$"]: type,
			strings,
			values,
		};
	};

/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 *
 * \`\`\`ts
 * const header = (title: string) => html\`<h1>\${title}</h1>\`;
 * \`\`\`
 *
 * The \`html\` tag returns a description of the DOM to render as a value. It is
 * lazy, meaning no work is done until the template is rendered. When rendering,
 * if a template comes from the same expression as a previously rendered result,
 * it's efficiently updated instead of replaced.
 */
const html = tag(HTML_RESULT);

/**
 * Interprets a template literal as an SVG fragment that can efficiently render
 * to and update a container.
 *
 * \`\`\`ts
 * const rect = svg\`<rect width="10" height="10"></rect>\`;
 *
 * const myImage = html\`
 *   <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
 *     \${rect}
 *   </svg>\`;
 * \`\`\`
 *
 * The \`svg\` *tag function* should only be used for SVG fragments, or elements
 * that would be contained **inside** an \`<svg>\` HTML element. A common error is
 * placing an \`<svg>\` *element* in a template tagged with the \`svg\` tag
 * function. The \`<svg>\` element is an HTML element and should be used within a
 * template tagged with the {@linkcode html} tag function.
 *
 * In LitElement usage, it's invalid to return an SVG fragment from the
 * \`render()\` method, as the SVG fragment will be contained within the element's
 * shadow root and thus not be properly contained within an \`<svg>\` HTML
 * element.
 */
const svg = tag(SVG_RESULT);

/**
 * Interprets a template literal as MathML fragment that can efficiently render
 * to and update a container.
 *
 * \`\`\`ts
 * const num = mathml\`<mn>1</mn>\`;
 *
 * const eq = html\`
 *   <math>
 *     \${num}
 *   </math>\`;
 * \`\`\`
 *
 * The \`mathml\` *tag function* should only be used for MathML fragments, or
 * elements that would be contained **inside** a \`<math>\` HTML element. A common
 * error is placing a \`<math>\` *element* in a template tagged with the \`mathml\`
 * tag function. The \`<math>\` element is an HTML element and should be used
 * within a template tagged with the {@linkcode html} tag function.
 *
 * In LitElement usage, it's invalid to return an MathML fragment from the
 * \`render()\` method, as the MathML fragment will be contained within the
 * element's shadow root and thus not be properly contained within a \`<math>\`
 * HTML element.
 */
const mathml = tag(MATHML_RESULT);

/**
 * A sentinel value that signals that a value was handled by a directive and
 * should not be written to the DOM.
 */
const noChange = Symbol.for("lit-noChange");

/**
 * A sentinel value that signals a ChildPart to fully clear its content.
 *
 * \`\`\`ts
 * const button = html\`\${
 *  user.isAdmin
 *    ? html\`<button>DELETE</button>\`
 *    : nothing
 * }\`;
 * \`\`\`
 *
 * Prefer using \`nothing\` over other falsy values as it provides a consistent
 * behavior between various expression binding contexts.
 *
 * In child expressions, \`undefined\`, \`null\`, \`''\`, and \`nothing\` all behave the
 * same and render no nodes. In attribute expressions, \`nothing\` _removes_ the
 * attribute, while \`undefined\` and \`null\` will render an empty string. In
 * property expressions \`nothing\` becomes \`undefined\`.
 */
const nothing = Symbol.for("lit-nothing");

/**
 * The cache of prepared templates, keyed by the tagged TemplateStringsArray
 * and _not_ accounting for the specific template tag used. This means that
 * template tags cannot be dynamic - they must statically be one of html, svg,
 * or attr. This restriction simplifies the cache lookup, which is on the hot
 * path for rendering.
 */
const templateCache = new WeakMap();

/**
 * Object specifying options for controlling lit-html rendering. Note that
 * while \`render\` may be called multiple times on the same \`container\` (and
 * \`renderBefore\` reference node) to efficiently update the rendered content,
 * only the options passed in during the first render are respected during
 * the lifetime of renders to that unique \`container\` + \`renderBefore\`
 * combination.
 */

const walker = d.createTreeWalker(
	d,
	129 /* NodeFilter.SHOW_{ELEMENT|COMMENT} */,
);
let sanitizerFactoryInternal = noopSanitizer;

//
// Classes only below here, const variable declarations only above here...
//
// Keeping variable declarations and classes together improves minification.
// Interfaces and type aliases can be interleaved freely.
//

// Type for classes that have a \`_directive\` or \`_directives[]\` field, used by
// \`resolveDirective\`

function trustFromTemplateString(tsa, stringFromTSA) {
	// A security check to prevent spoofing of Lit template results.
	// In the future, we may be able to replace this with Array.isTemplateObject,
	// though we might need to make that check inside of the html and svg
	// functions, because precompiled templates don't come in as
	// TemplateStringArray objects.
	if (!isArray(tsa) || !Object.hasOwn(tsa, "raw")) {
		let message = "invalid template strings array";
		if (DEV_MODE) {
			message = \`
          Internal Error: expected template strings to be an array
          with a 'raw' field. Faking a template strings array by
          calling html or svg like an ordinary function is effectively
          the same as calling unsafeHtml and can lead to major security
          issues, e.g. opening your code up to XSS attacks.
          If you're using the html or svg tagged template functions normally
          and still seeing this error, please file a bug at
          https://github.com/lit/lit/issues/new?template=bug_report.md
          and include information about your build tooling, if any.
        \`
				.trim()
				.replace(/\\n */g, "\\n");
		}
		throw new Error(message);
	}
	return policy !== undefined
		? policy.createHTML(stringFromTSA)
		: stringFromTSA;
}

/**
 * Returns an HTML string for the given TemplateStringsArray and result type
 * (HTML or SVG), along with the case-sensitive bound attribute names in
 * template order. The HTML contains comment markers denoting the \`ChildPart\`s
 * and suffixes on bound attributes denoting the \`AttributeParts\`.
 *
 * @param strings template strings array
 * @param type HTML or SVG
 * @return Array containing \`[html, attrNames]\` (array returned for terseness,
 *     to avoid object fields since this code is shared with non-minified SSR
 *     code)
 */
const getTemplateHtml = (strings, type) => {
	// Insert makers into the template HTML to represent the position of
	// bindings. The following code scans the template strings to determine the
	// syntactic position of the bindings. They can be in text position, where
	// we insert an HTML comment, attribute value position, where we insert a
	// sentinel string and re-write the attribute name, or inside a tag where
	// we insert the sentinel string.
	const l = strings.length - 1;
	// Stores the case-sensitive bound attribute names in the order of their
	// parts. ElementParts are also reflected in this array as undefined
	// rather than a string, to disambiguate from attribute bindings.
	const attrNames = [];
	let html =
		type === SVG_RESULT ? "<svg>" : type === MATHML_RESULT ? "<math>" : "";

	// When we're inside a raw text tag (not it's text content), the regex
	// will still be tagRegex so we can find attributes, but will switch to
	// this regex when the tag ends.
	let rawTextEndRegex;

	// The current parsing state, represented as a reference to one of the
	// regexes
	let regex = textEndRegex;
	for (let i = 0; i < l; i++) {
		const s = strings[i];
		// The index of the end of the last attribute name. When this is
		// positive at end of a string, it means we're in an attribute value
		// position and need to rewrite the attribute name.
		// We also use a special value of -2 to indicate that we encountered
		// the end of a string in attribute name position.
		let attrNameEndIndex = -1;
		let attrName;
		let lastIndex = 0;
		let match;

		// The conditions in this loop handle the current parse state, and the
		// assignments to the \`regex\` variable are the state transitions.
		while (lastIndex < s.length) {
			// Make sure we start searching from where we previously left off
			regex.lastIndex = lastIndex;
			match = regex.exec(s);
			if (match === null) {
				break;
			}
			lastIndex = regex.lastIndex;
			if (regex === textEndRegex) {
				if (match[COMMENT_START] === "!--") {
					regex = commentEndRegex;
				} else if (match[COMMENT_START] !== undefined) {
					// We started a weird comment, like </{
					regex = comment2EndRegex;
				} else if (match[TAG_NAME] !== undefined) {
					if (rawTextElement.test(match[TAG_NAME])) {
						// Record if we encounter a raw-text element. We'll switch to
						// this regex at the end of the tag.
						rawTextEndRegex = new RegExp(\`</\${match[TAG_NAME]}\`, "g");
					}
					regex = tagEndRegex;
				} else if (match[DYNAMIC_TAG_NAME] !== undefined) {
					if (DEV_MODE) {
						throw new Error(
							"Bindings in tag names are not supported. Please use static templates instead. " +
								"See https://lit.dev/docs/templates/expressions/#static-expressions",
						);
					}
					regex = tagEndRegex;
				}
			} else if (regex === tagEndRegex) {
				if (match[ENTIRE_MATCH] === ">") {
					// End of a tag. If we had started a raw-text element, use that
					// regex
					regex = rawTextEndRegex ?? textEndRegex;
					// We may be ending an unquoted attribute value, so make sure we
					// clear any pending attrNameEndIndex
					attrNameEndIndex = -1;
				} else if (match[ATTRIBUTE_NAME] === undefined) {
					// Attribute name position
					attrNameEndIndex = -2;
				} else {
					attrNameEndIndex = regex.lastIndex - match[SPACES_AND_EQUALS].length;
					attrName = match[ATTRIBUTE_NAME];
					regex =
						match[QUOTE_CHAR] === undefined
							? tagEndRegex
							: match[QUOTE_CHAR] === '"'
								? doubleQuoteAttrEndRegex
								: singleQuoteAttrEndRegex;
				}
			} else if (
				regex === doubleQuoteAttrEndRegex ||
				regex === singleQuoteAttrEndRegex
			) {
				regex = tagEndRegex;
			} else if (regex === commentEndRegex || regex === comment2EndRegex) {
				regex = textEndRegex;
			} else {
				// Not one of the five state regexes, so it must be the dynamically
				// created raw text regex and we're at the close of that element.
				regex = tagEndRegex;
				rawTextEndRegex = undefined;
			}
		}
		if (DEV_MODE) {
			// If we have a attrNameEndIndex, which indicates that we should
			// rewrite the attribute name, assert that we're in a valid attribute
			// position - either in a tag, or a quoted attribute value.
			console.assert(
				attrNameEndIndex === -1 ||
					regex === tagEndRegex ||
					regex === singleQuoteAttrEndRegex ||
					regex === doubleQuoteAttrEndRegex,
				"unexpected parse state B",
			);
		}

		// We have four cases:
		//  1. We're in text position, and not in a raw text element
		//     (regex === textEndRegex): insert a comment marker.
		//  2. We have a non-negative attrNameEndIndex which means we need to
		//     rewrite the attribute name to add a bound attribute suffix.
		//  3. We're at the non-first binding in a multi-binding attribute, use a
		//     plain marker.
		//  4. We're somewhere else inside the tag. If we're in attribute name
		//     position (attrNameEndIndex === -2), add a sequential suffix to
		//     generate a unique attribute name.

		// Detect a binding next to self-closing tag end and insert a space to
		// separate the marker from the tag end:
		const end =
			regex === tagEndRegex && strings[i + 1].startsWith("/>") ? " " : "";
		html +=
			regex === textEndRegex
				? s + nodeMarker
				: attrNameEndIndex >= 0
					? (attrNames.push(attrName),
						s.slice(0, attrNameEndIndex) +
							boundAttributeSuffix +
							s.slice(attrNameEndIndex)) +
						marker +
						end
					: s + marker + (attrNameEndIndex === -2 ? i : end);
	}
	const htmlResult =
		html +
		(strings[l] || "<?>") +
		(type === SVG_RESULT ? "</svg>" : type === MATHML_RESULT ? "</math>" : "");

	// Returned as an array for terseness
	return [trustFromTemplateString(strings, htmlResult), attrNames];
};

/** @internal */

class Template {
	/** @internal */

	parts = [];
	constructor(
		// This property needs to remain unminified.
		{ strings, ["_$litType$"]: type },
		options,
	) {
		let node;
		let nodeIndex = 0;
		let attrNameIndex = 0;
		const partCount = strings.length - 1;
		const parts = this.parts;

		// Create template element
		const [html, attrNames] = getTemplateHtml(strings, type);
		this.el = Template.createElement(html, options);
		walker.currentNode = this.el.content;

		// Re-parent SVG or MathML nodes into template root
		if (type === SVG_RESULT || type === MATHML_RESULT) {
			const wrapper = this.el.content.firstChild;
			wrapper.replaceWith(...wrapper.childNodes);
		}

		// Walk the template to find binding markers and create TemplateParts
		while ((node = walker.nextNode()) !== null && parts.length < partCount) {
			if (node.nodeType === 1) {
				if (DEV_MODE) {
					const tag = node.localName;
					// Warn if \`textarea\` includes an expression and throw if \`template\`
					// does since these are not supported. We do this by checking
					// innerHTML for anything that looks like a marker. This catches
					// cases like bindings in textarea there markers turn into text nodes.
					if (
						/^(?:textarea|template)$/i.test(tag) &&
						node.innerHTML.includes(marker)
					) {
						const m =
							\`Expressions are not supported inside \\\`\${tag}\\\` \` +
							\`elements. See https://lit.dev/msg/expression-in-\${tag} for more \` +
							"information.";
						if (tag === "template") {
							throw new Error(m);
						}
						issueWarning("", m);
					}
				}
				// TODO (justinfagnani): for attempted dynamic tag names, we don't
				// increment the bindingIndex, and it'll be off by 1 in the element
				// and off by two after it.
				if (node.hasAttributes()) {
					for (const name of node.getAttributeNames()) {
						if (name.endsWith(boundAttributeSuffix)) {
							const realName = attrNames[attrNameIndex++];
							const value = node.getAttribute(name);
							const statics = value.split(marker);
							const m = /([.?@])?(.*)/.exec(realName);
							parts.push({
								type: ATTRIBUTE_PART,
								index: nodeIndex,
								name: m[2],
								strings: statics,
								ctor:
									m[1] === "."
										? PropertyPart
										: m[1] === "?"
											? BooleanAttributePart
											: m[1] === "@"
												? EventPart
												: AttributePart,
							});
							node.removeAttribute(name);
						} else if (name.startsWith(marker)) {
							parts.push({
								type: ELEMENT_PART,
								index: nodeIndex,
							});
							node.removeAttribute(name);
						}
					}
				}
				// TODO (justinfagnani): benchmark the regex against testing for each
				// of the 3 raw text element names.
				if (rawTextElement.test(node.tagName)) {
					// For raw text elements we need to split the text content on
					// markers, create a Text node for each segment, and create
					// a TemplatePart for each marker.
					const strings = node.textContent.split(marker);
					const lastIndex = strings.length - 1;
					if (lastIndex > 0) {
						node.textContent = trustedTypes ? trustedTypes.emptyScript : "";
						// Generate a new text node for each literal section
						// These nodes are also used as the markers for node parts
						// We can't use empty text nodes as markers because they're
						// normalized when cloning in IE (could simplify when
						// IE is no longer supported)
						for (let i = 0; i < lastIndex; i++) {
							node.append(strings[i], createMarker());
							// Walk past the marker node we just added
							walker.nextNode();
							parts.push({
								type: CHILD_PART,
								index: ++nodeIndex,
							});
						}
						// Note because this marker is added after the walker's current
						// node, it will be walked to in the outer loop (and ignored), so
						// we don't need to adjust nodeIndex here
						node.append(strings[lastIndex], createMarker());
					}
				}
			} else if (node.nodeType === 8) {
				const data = node.data;
				if (data === markerMatch) {
					parts.push({
						type: CHILD_PART,
						index: nodeIndex,
					});
				} else {
					let i = -1;
					while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
						// Comment node has a binding marker inside, make an inactive part
						// The binding won't work, but subsequent bindings will
						parts.push({
							type: COMMENT_PART,
							index: nodeIndex,
						});
						// Move to the end of the match
						i += marker.length - 1;
					}
				}
			}
			nodeIndex++;
		}
		if (DEV_MODE) {
			// If there was a duplicate attribute on a tag, then when the tag is
			// parsed into an element the attribute gets de-duplicated. We can detect
			// this mismatch if we haven't precisely consumed every attribute name
			// when preparing the template. This works because \`attrNames\` is built
			// from the template string and \`attrNameIndex\` comes from processing the
			// resulting DOM.
			if (attrNames.length !== attrNameIndex) {
				throw new Error(
					"Detected duplicate attribute bindings. This occurs if your template " +
						"has duplicate attributes on an element tag. For example " +
						\`"<input ?disabled=\\\${true} ?disabled=\\\${false}>" contains a \` +
						\`duplicate "disabled" attribute. The error was detected in \` +
						"the following template: \\n" +
						"\`" +
						strings.join("\${...}") +
						"\`",
				);
			}
		}

		// We could set walker.currentNode to another node here to prevent a memory
		// leak, but every time we prepare a template, we immediately render it
		// and re-use the walker in new TemplateInstance._clone().
		debugLogEvent?.({
			kind: "template prep",
			template: this,
			clonableTemplate: this.el,
			parts: this.parts,
			strings,
		});
	}

	// Overridden via \`litHtmlPolyfillSupport\` to provide platform support.
	/** @nocollapse */
	static createElement(html, _options) {
		const el = d.createElement("template");
		el.innerHTML = html;
		return el;
	}
}
function resolveDirective(part, value, parent = part, attributeIndex) {
	// Bail early if the value is explicitly noChange. Note, this means any
	// nested directive is still attached and is not run.
	if (value === noChange || value === nothing) {
		return value;
	}

	let currentDirective =
		attributeIndex !== undefined
			? parent.__directives?.[attributeIndex]
			: parent.__directive;
	const nextDirectiveConstructor = isPrimitive(value)
		? undefined
		: // This property needs to remain unminified.
			value["_$litDirective$"];
	if (currentDirective?.constructor !== nextDirectiveConstructor) {
		// This property needs to remain unminified.
		currentDirective?.["_$notifyDirectiveConnectionChanged"]?.(false);
		if (nextDirectiveConstructor === undefined) {
			currentDirective = undefined;
		} else {
			currentDirective = new nextDirectiveConstructor(part);
			currentDirective?._$initialize(part, parent, attributeIndex);
		}
		if (attributeIndex !== undefined) {
			(parent.__directives ??= [])[attributeIndex] = currentDirective;
		} else {
			parent.__directive = currentDirective;
		}
	}
	if (currentDirective !== undefined) {
		value = resolveDirective(
			part,
			currentDirective._$resolve(part, value.values),
			currentDirective,
			attributeIndex,
		);
	}
	return value;
}
/**
 * An updateable instance of a Template. Holds references to the Parts used to
 * update the template instance.
 */
class TemplateInstance {
	_$parts = [];

	/** @internal */

	/** @internal */
	_$disconnectableChildren = undefined;
	constructor(template, parent) {
		this._$template = template;
		this._$parent = parent;
	}

	// Called by ChildPart parentNode getter
	get parentNode() {
		return this._$parent.parentNode;
	}

	// See comment in Disconnectable interface for why this is a getter
	get _$isConnected() {
		return this._$parent._$isConnected;
	}

	// This method is separate from the constructor because we need to return a
	// DocumentFragment and we don't want to hold onto it with an instance field.
	_clone(options) {
		const {
			el: { content },
			parts,
		} = this._$template;
		const fragment = (options?.creationScope ?? d).importNode(content, true);
		walker.currentNode = fragment;
		let node = walker.nextNode();
		let nodeIndex = 0;
		let partIndex = 0;
		let templatePart = parts[0];
		while (templatePart !== undefined) {
			if (nodeIndex === templatePart.index) {
				let part;
				if (templatePart.type === CHILD_PART) {
					part = new ChildPart(node, node.nextSibling, this, options);
				} else if (templatePart.type === ATTRIBUTE_PART) {
					part = new templatePart.ctor(
						node,
						templatePart.name,
						templatePart.strings,
						this,
						options,
					);
				} else if (templatePart.type === ELEMENT_PART) {
					part = new ElementPart(node, this, options);
				}
				this._$parts.push(part);
				templatePart = parts[++partIndex];
			}
			if (nodeIndex !== templatePart?.index) {
				node = walker.nextNode();
				nodeIndex++;
			}
		}
		// We need to set the currentNode away from the cloned tree so that we
		// don't hold onto the tree even if the tree is detached and should be
		// freed.
		walker.currentNode = d;
		return fragment;
	}
	_update(values) {
		let i = 0;
		for (const part of this._$parts) {
			if (part !== undefined) {
				debugLogEvent?.({
					kind: "set part",
					part,
					value: values[i],
					valueIndex: i,
					values,
					templateInstance: this,
				});
				if (part.strings !== undefined) {
					part._$setValue(values, part, i);
					// The number of values the part consumes is part.strings.length - 1
					// since values are in between template spans. We increment i by 1
					// later in the loop, so increment it by part.strings.length - 2 here
					i += part.strings.length - 2;
				} else {
					part._$setValue(values[i]);
				}
			}
			i++;
		}
	}
}

/*
 * Parts
 */

/**
 * A TemplatePart represents a dynamic part in a template, before the template
 * is instantiated. When a template is instantiated Parts are created from
 * TemplateParts.
 */

class ChildPart {
	type = CHILD_PART;
	_$committedValue = nothing;
	/** @internal */

	/** @internal */

	/** @internal */

	/** @internal */

	/**
	 * Connection state for RootParts only (i.e. ChildPart without _$parent
	 * returned from top-level \`render\`). This field is unused otherwise. The
	 * intention would be clearer if we made \`RootPart\` a subclass of \`ChildPart\`
	 * with this field (and a different _$isConnected getter), but the subclass
	 * caused a perf regression, possibly due to making call sites polymorphic.
	 * @internal
	 */

	// See comment in Disconnectable interface for why this is a getter
	get _$isConnected() {
		// ChildParts that are not at the root should always be created with a
		// parent; only RootChildNode's won't, so they return the local isConnected
		// state
		return this._$parent?._$isConnected ?? this.__isConnected;
	}

	// The following fields will be patched onto ChildParts when required by
	// AsyncDirective
	/** @internal */
	_$disconnectableChildren = undefined;
	/** @internal */

	/** @internal */

	constructor(startNode, endNode, parent, options) {
		this._$startNode = startNode;
		this._$endNode = endNode;
		this._$parent = parent;
		this.options = options;
		// Note __isConnected is only ever accessed on RootParts (i.e. when there is
		// no _$parent); the value on a non-root-part is "don't care", but checking
		// for parent would be more code
		this.__isConnected = options?.isConnected ?? true;
		if (ENABLE_EXTRA_SECURITY_HOOKS) {
			// Explicitly initialize for consistent class shape.
			this._textSanitizer = undefined;
		}
	}

	/**
	 * The parent node into which the part renders its content.
	 *
	 * A ChildPart's content consists of a range of adjacent child nodes of
	 * \`.parentNode\`, possibly bordered by 'marker nodes' (\`.startNode\` and
	 * \`.endNode\`).
	 *
	 * - If both \`.startNode\` and \`.endNode\` are non-null, then the part's content
	 * consists of all siblings between \`.startNode\` and \`.endNode\`, exclusively.
	 *
	 * - If \`.startNode\` is non-null but \`.endNode\` is null, then the part's
	 * content consists of all siblings following \`.startNode\`, up to and
	 * including the last child of \`.parentNode\`. If \`.endNode\` is non-null, then
	 * \`.startNode\` will always be non-null.
	 *
	 * - If both \`.endNode\` and \`.startNode\` are null, then the part's content
	 * consists of all child nodes of \`.parentNode\`.
	 */
	get parentNode() {
		let parentNode = wrap(this._$startNode).parentNode;
		const parent = this._$parent;
		if (
			parent !== undefined &&
			parentNode?.nodeType === 11 /* Node.DOCUMENT_FRAGMENT */
		) {
			// If the parentNode is a DocumentFragment, it may be because the DOM is
			// still in the cloned fragment during initial render; if so, get the real
			// parentNode the part will be committed into by asking the parent.
			parentNode = parent.parentNode;
		}
		return parentNode;
	}

	/**
	 * The part's leading marker node, if any. See \`.parentNode\` for more
	 * information.
	 */
	get startNode() {
		return this._$startNode;
	}

	/**
	 * The part's trailing marker node, if any. See \`.parentNode\` for more
	 * information.
	 */
	get endNode() {
		return this._$endNode;
	}
	_$setValue(value, directiveParent = this) {
		if (DEV_MODE && this.parentNode === null) {
			throw new Error(
				\`This \\\`ChildPart\\\` has no \\\`parentNode\\\` and therefore cannot accept a value. This likely means the element containing the part was manipulated in an unsupported way outside of Lit's control such that the part's marker nodes were ejected from DOM. For example, setting the element's \\\`innerHTML\\\` or \\\`textContent\\\` can do this.\`,
			);
		}
		value = resolveDirective(this, value, directiveParent);
		if (isPrimitive(value)) {
			// Non-rendering child values. It's important that these do not render
			// empty text nodes to avoid issues with preventing default <slot>
			// fallback content.
			if (value === nothing || value == null || value === "") {
				if (this._$committedValue !== nothing) {
					debugLogEvent?.({
						kind: "commit nothing to child",
						start: this._$startNode,
						end: this._$endNode,
						parent: this._$parent,
						options: this.options,
					});
					this._$clear();
				}
				this._$committedValue = nothing;
			} else if (value !== this._$committedValue && value !== noChange) {
				this._commitText(value);
			}
			// This property needs to remain unminified.
		} else if (value["_$litType$"] !== undefined) {
			this._commitTemplateResult(value);
		} else if (value.nodeType !== undefined) {
			if (DEV_MODE && this.options?.host === value) {
				this._commitText(
					\`[probable mistake: rendered a template's host in itself \` +
						"(commonly caused by writing \\\${this} in a template]",
				);
				console.warn(
					"Attempted to render the template host",
					value,
					"inside itself. This is almost always a mistake, and in dev mode ",
					\`we render some warning text. In production however, we'll \`,
					"render it, which will usually result in an error, and sometimes ",
					"in the element disappearing from the DOM.",
				);
				return;
			}
			this._commitNode(value);
		} else if (isIterable(value)) {
			this._commitIterable(value);
		} else {
			// Fallback, will render the string representation
			this._commitText(value);
		}
	}
	_insert(node) {
		return wrap(wrap(this._$startNode).parentNode).insertBefore(
			node,
			this._$endNode,
		);
	}
	_commitNode(value) {
		if (this._$committedValue !== value) {
			this._$clear();
			if (
				ENABLE_EXTRA_SECURITY_HOOKS &&
				sanitizerFactoryInternal !== noopSanitizer
			) {
				const parentNodeName = this._$startNode.parentNode?.nodeName;
				if (parentNodeName === "STYLE" || parentNodeName === "SCRIPT") {
					let message = "Forbidden";
					if (DEV_MODE) {
						if (parentNodeName === "STYLE") {
							message =
								"Lit does not support binding inside style nodes. " +
								"This is a security risk, as style injection attacks can " +
								"exfiltrate data and spoof UIs. " +
								"Consider instead using css\\\`...\\\` literals " +
								"to compose styles, and do dynamic styling with " +
								"css custom properties, ::parts, <slot>s, " +
								"and by mutating the DOM rather than stylesheets.";
						} else {
							message =
								"Lit does not support binding inside script nodes. " +
								"This is a security risk, as it could allow arbitrary " +
								"code execution.";
						}
					}
					throw new Error(message);
				}
			}
			debugLogEvent?.({
				kind: "commit node",
				start: this._$startNode,
				parent: this._$parent,
				value: value,
				options: this.options,
			});
			this._$committedValue = this._insert(value);
		}
	}
	_commitText(value) {
		// If the committed value is a primitive it means we called _commitText on
		// the previous render, and we know that this._$startNode.nextSibling is a
		// Text node. We can now just replace the text content (.data) of the node.
		if (
			this._$committedValue !== nothing &&
			isPrimitive(this._$committedValue)
		) {
			const node = wrap(this._$startNode).nextSibling;
			if (ENABLE_EXTRA_SECURITY_HOOKS) {
				if (this._textSanitizer === undefined) {
					this._textSanitizer = createSanitizer(node, "data", "property");
				}
				value = this._textSanitizer(value);
			}
			debugLogEvent?.({
				kind: "commit text",
				node,
				value,
				options: this.options,
			});
			node.data = value;
		} else {
			if (ENABLE_EXTRA_SECURITY_HOOKS) {
				const textNode = d.createTextNode("");
				this._commitNode(textNode);
				// When setting text content, for security purposes it matters a lot
				// what the parent is. For example, <style> and <script> need to be
				// handled with care, while <span> does not. So first we need to put a
				// text node into the document, then we can sanitize its content.
				if (this._textSanitizer === undefined) {
					this._textSanitizer = createSanitizer(textNode, "data", "property");
				}
				value = this._textSanitizer(value);
				debugLogEvent?.({
					kind: "commit text",
					node: textNode,
					value,
					options: this.options,
				});
				textNode.data = value;
			} else {
				this._commitNode(d.createTextNode(value));
				debugLogEvent?.({
					kind: "commit text",
					node: wrap(this._$startNode).nextSibling,
					value,
					options: this.options,
				});
			}
		}
		this._$committedValue = value;
	}
	_commitTemplateResult(result) {
		// This property needs to remain unminified.
		const { values, ["_$litType$"]: type } = result;
		// If $litType$ is a number, result is a plain TemplateResult and we get
		// the template from the template cache. If not, result is a
		// CompiledTemplateResult and _$litType$ is a CompiledTemplate and we need
		// to create the <template> element the first time we see it.
		const template =
			typeof type === "number"
				? this._$getTemplate(result)
				: (type.el === undefined &&
						(type.el = Template.createElement(
							trustFromTemplateString(type.h, type.h[0]),
							this.options,
						)),
					type);
		if (this._$committedValue?._$template === template) {
			debugLogEvent?.({
				kind: "template updating",
				template,
				instance: this._$committedValue,
				parts: this._$committedValue._$parts,
				options: this.options,
				values,
			});
			this._$committedValue._update(values);
		} else {
			const instance = new TemplateInstance(template, this);
			const fragment = instance._clone(this.options);
			debugLogEvent?.({
				kind: "template instantiated",
				template,
				instance,
				parts: instance._$parts,
				options: this.options,
				fragment,
				values,
			});
			instance._update(values);
			debugLogEvent?.({
				kind: "template instantiated and updated",
				template,
				instance,
				parts: instance._$parts,
				options: this.options,
				fragment,
				values,
			});
			this._commitNode(fragment);
			this._$committedValue = instance;
		}
	}

	// Overridden via \`litHtmlPolyfillSupport\` to provide platform support.
	/** @internal */
	_$getTemplate(result) {
		let template = templateCache.get(result.strings);
		if (template === undefined) {
			templateCache.set(result.strings, (template = new Template(result)));
		}
		return template;
	}
	_commitIterable(value) {
		// For an Iterable, we create a new InstancePart per item, then set its
		// value to the item. This is a little bit of overhead for every item in
		// an Iterable, but it lets us recurse easily and efficiently update Arrays
		// of TemplateResults that will be commonly returned from expressions like:
		// array.map((i) => html\`\${i}\`), by reusing existing TemplateInstances.

		// If value is an array, then the previous render was of an
		// iterable and value will contain the ChildParts from the previous
		// render. If value is not an array, clear this part and make a new
		// array for ChildParts.
		if (!isArray(this._$committedValue)) {
			this._$committedValue = [];
			this._$clear();
		}

		// Lets us keep track of how many items we stamped so we can clear leftover
		// items from a previous render
		const itemParts = this._$committedValue;
		let partIndex = 0;
		let itemPart;
		for (const item of value) {
			if (partIndex === itemParts.length) {
				// If no existing part, create a new one
				// TODO (justinfagnani): test perf impact of always creating two parts
				// instead of sharing parts between nodes
				// https://github.com/lit/lit/issues/1266
				itemParts.push(
					(itemPart = new ChildPart(
						this._insert(createMarker()),
						this._insert(createMarker()),
						this,
						this.options,
					)),
				);
			} else {
				// Reuse an existing part
				itemPart = itemParts[partIndex];
			}
			itemPart._$setValue(item);
			partIndex++;
		}
		if (partIndex < itemParts.length) {
			// itemParts always have end nodes
			this._$clear(itemPart && wrap(itemPart._$endNode).nextSibling, partIndex);
			// Truncate the parts array so _value reflects the current state
			itemParts.length = partIndex;
		}
	}

	/**
	 * Removes the nodes contained within this Part from the DOM.
	 *
	 * @param start Start node to clear from, for clearing a subset of the part's
	 *     DOM (used when truncating iterables)
	 * @param from  When \`start\` is specified, the index within the iterable from
	 *     which ChildParts are being removed, used for disconnecting directives in
	 *     those Parts.
	 *
	 * @internal
	 */
	_$clear(start = wrap(this._$startNode).nextSibling, from) {
		this._$notifyConnectionChanged?.(false, true, from);
		while (start && start !== this._$endNode) {
			const n = wrap(start).nextSibling;
			wrap(start).remove();
			start = n;
		}
	}
	/**
	 * Implementation of RootPart's \`isConnected\`. Note that this method
	 * should only be called on \`RootPart\`s (the \`ChildPart\` returned from a
	 * top-level \`render()\` call). It has no effect on non-root ChildParts.
	 * @param isConnected Whether to set
	 * @internal
	 */
	setConnected(isConnected) {
		if (this._$parent === undefined) {
			this.__isConnected = isConnected;
			this._$notifyConnectionChanged?.(isConnected);
		} else if (DEV_MODE) {
			throw new Error(
				"part.setConnected() may only be called on a " +
					"RootPart returned from render().",
			);
		}
	}
}

/**
 * A top-level \`ChildPart\` returned from \`render\` that manages the connected
 * state of \`AsyncDirective\`s created throughout the tree below it.
 */

class AttributePart {
	type = ATTRIBUTE_PART;

	/**
	 * If this attribute part represents an interpolation, this contains the
	 * static strings of the interpolation. For single-value, complete bindings,
	 * this is undefined.
	 */

	/** @internal */
	_$committedValue = nothing;
	/** @internal */

	/** @internal */

	/** @internal */
	_$disconnectableChildren = undefined;
	get tagName() {
		return this.element.tagName;
	}

	// See comment in Disconnectable interface for why this is a getter
	get _$isConnected() {
		return this._$parent._$isConnected;
	}
	constructor(element, name, strings, parent, options) {
		this.element = element;
		this.name = name;
		this._$parent = parent;
		this.options = options;
		if (strings.length > 2 || strings[0] !== "" || strings[1] !== "") {
			this._$committedValue = new Array(strings.length - 1).fill(new String());
			this.strings = strings;
		} else {
			this._$committedValue = nothing;
		}
		if (ENABLE_EXTRA_SECURITY_HOOKS) {
			this._sanitizer = undefined;
		}
	}

	/**
	 * Sets the value of this part by resolving the value from possibly multiple
	 * values and static strings and committing it to the DOM.
	 * If this part is single-valued, \`this._strings\` will be undefined, and the
	 * method will be called with a single value argument. If this part is
	 * multi-value, \`this._strings\` will be defined, and the method is called
	 * with the value array of the part's owning TemplateInstance, and an offset
	 * into the value array from which the values should be read.
	 * This method is overloaded this way to eliminate short-lived array slices
	 * of the template instance values, and allow a fast-path for single-valued
	 * parts.
	 *
	 * @param value The part value, or an array of values for multi-valued parts
	 * @param valueIndex the index to start reading values from. \`undefined\` for
	 *   single-valued parts
	 * @param noCommit causes the part to not commit its value to the DOM. Used
	 *   in hydration to prime attribute parts with their first-rendered value,
	 *   but not set the attribute, and in SSR to no-op the DOM operation and
	 *   capture the value for serialization.
	 *
	 * @internal
	 */
	_$setValue(value, directiveParent = this, valueIndex, noCommit) {
		const strings = this.strings;

		// Whether any of the values has changed, for dirty-checking
		let change = false;
		if (strings === undefined) {
			// Single-value binding case
			value = resolveDirective(this, value, directiveParent, 0);
			change =
				!isPrimitive(value) ||
				(value !== this._$committedValue && value !== noChange);
			if (change) {
				this._$committedValue = value;
			}
		} else {
			// Interpolation case
			const values = value;
			value = strings[0];
			let i, v;
			for (i = 0; i < strings.length - 1; i++) {
				v = resolveDirective(this, values[valueIndex + i], directiveParent, i);
				if (v === noChange) {
					// If the user-provided value is \`noChange\`, use the previous value
					v = this._$committedValue[i];
				}
				change ||= !isPrimitive(v) || v !== this._$committedValue[i];
				if (v === nothing) {
					value = nothing;
				} else if (value !== nothing) {
					value += (v ?? "") + strings[i + 1];
				}
				// We always record each value, even if one is \`nothing\`, for future
				// change detection.
				this._$committedValue[i] = v;
			}
		}
		if (change && !noCommit) {
			this._commitValue(value);
		}
	}

	/** @internal */
	_commitValue(value) {
		if (value === nothing) {
			wrap(this.element).removeAttribute(this.name);
		} else {
			if (ENABLE_EXTRA_SECURITY_HOOKS) {
				if (this._sanitizer === undefined) {
					this._sanitizer = sanitizerFactoryInternal(
						this.element,
						this.name,
						"attribute",
					);
				}
				value = this._sanitizer(value ?? "");
			}
			debugLogEvent?.({
				kind: "commit attribute",
				element: this.element,
				name: this.name,
				value,
				options: this.options,
			});
			wrap(this.element).setAttribute(this.name, value ?? "");
		}
	}
}
class PropertyPart extends AttributePart {
	type = PROPERTY_PART;

	/** @internal */
	_commitValue(value) {
		if (ENABLE_EXTRA_SECURITY_HOOKS) {
			if (this._sanitizer === undefined) {
				this._sanitizer = sanitizerFactoryInternal(
					this.element,
					this.name,
					"property",
				);
			}
			value = this._sanitizer(value);
		}
		debugLogEvent &&
			debugLogEvent({
				kind: "commit property",
				element: this.element,
				name: this.name,
				value,
				options: this.options,
			});
		this.element[this.name] = value === nothing ? undefined : value;
	}
}
class BooleanAttributePart extends AttributePart {
	type = BOOLEAN_ATTRIBUTE_PART;

	/** @internal */
	_commitValue(value) {
		debugLogEvent?.({
			kind: "commit boolean attribute",
			element: this.element,
			name: this.name,
			value: !!(value && value !== nothing),
			options: this.options,
		});
		wrap(this.element).toggleAttribute(this.name, !!value && value !== nothing);
	}
}

/**
 * An AttributePart that manages an event listener via add/removeEventListener.
 *
 * This part works by adding itself as the event listener on an element, then
 * delegating to the value passed to it. This reduces the number of calls to
 * add/removeEventListener if the listener changes frequently, such as when an
 * inline function is used as a listener.
 *
 * Because event options are passed when adding listeners, we must take case
 * to add and remove the part as a listener when the event options change.
 */

class EventPart extends AttributePart {
	type = EVENT_PART;
	constructor(element, name, strings, parent, options) {
		super(element, name, strings, parent, options);
		if (DEV_MODE && this.strings !== undefined) {
			throw new Error(
				\`A \\\`<\${element.localName}>\\\` has a \\\`@\${name}=...\\\` listener with \` +
					"invalid content. Event listeners in templates must have exactly " +
					"one expression and no surrounding text.",
			);
		}
	}

	// EventPart does not use the base _$setValue/_resolveValue implementation
	// since the dirty checking is more complex
	/** @internal */
	_$setValue(newListener, directiveParent = this) {
		newListener =
			resolveDirective(this, newListener, directiveParent, 0) ?? nothing;
		if (newListener === noChange) {
			return;
		}
		const oldListener = this._$committedValue;

		// If the new value is nothing or any options change we have to remove the
		// part as a listener.
		const shouldRemoveListener =
			(newListener === nothing && oldListener !== nothing) ||
			newListener.capture !== oldListener.capture ||
			newListener.once !== oldListener.once ||
			newListener.passive !== oldListener.passive;

		// If the new value is not nothing and we removed the listener, we have
		// to add the part as a listener.
		const shouldAddListener =
			newListener !== nothing &&
			(oldListener === nothing || shouldRemoveListener);
		debugLogEvent?.({
			kind: "commit event listener",
			element: this.element,
			name: this.name,
			value: newListener,
			options: this.options,
			removeListener: shouldRemoveListener,
			addListener: shouldAddListener,
			oldListener,
		});
		if (shouldRemoveListener) {
			this.element.removeEventListener(this.name, this, oldListener);
		}
		if (shouldAddListener) {
			// Beware: IE11 and Chrome 41 don't like using the listener as the
			// options object. Figure out how to deal w/ this in IE11 - maybe
			// patch addEventListener?
			this.element.addEventListener(this.name, this, newListener);
		}
		this._$committedValue = newListener;
	}
	handleEvent(event) {
		if (typeof this._$committedValue === "function") {
			this._$committedValue.call(this.options?.host ?? this.element, event);
		} else {
			this._$committedValue.handleEvent(event);
		}
	}
}
class ElementPart {
	type = ELEMENT_PART;

	/** @internal */

	// This is to ensure that every Part has a _$committedValue

	/** @internal */

	/** @internal */
	_$disconnectableChildren = undefined;
	constructor(element, parent, options) {
		this.element = element;
		this._$parent = parent;
		this.options = options;
	}

	// See comment in Disconnectable interface for why this is a getter
	get _$isConnected() {
		return this._$parent._$isConnected;
	}
	_$setValue(value) {
		debugLogEvent?.({
			kind: "commit to element binding",
			element: this.element,
			value,
			options: this.options,
		});
		resolveDirective(this, value);
	}
}

/**
 * END USERS SHOULD NOT RELY ON THIS OBJECT.
 *
 * Private exports for use by other Lit packages, not intended for use by
 * external users.
 *
 * We currently do not make a mangled rollup build of the lit-ssr code. In order
 * to keep a number of (otherwise private) top-level exports mangled in the
 * client side code, we a _$LH object containing those members (or
 * helper methods for accessing private fields of those members), and then
 * re-them for use in lit-ssr. This keeps lit-ssr agnostic to whether the
 * client-side code is being used in \`dev\` mode or \`prod\` mode.
 *
 * This has a unique name, to disambiguate it from private exports in
 * lit-element, which re-exports all of lit-html.
 *
 * @private
 */
const _$LH = {
	// Used in lit-ssr
	_boundAttributeSuffix: boundAttributeSuffix,
	_marker: marker,
	_markerMatch: markerMatch,
	_HTML_RESULT: HTML_RESULT,
	_getTemplateHtml: getTemplateHtml,
	// Used in tests and private-ssr-support
	_TemplateInstance: TemplateInstance,
	_isIterable: isIterable,
	_resolveDirective: resolveDirective,
	_ChildPart: ChildPart,
	_AttributePart: AttributePart,
	_BooleanAttributePart: BooleanAttributePart,
	_EventPart: EventPart,
	_PropertyPart: PropertyPart,
	_ElementPart: ElementPart,
};

// Apply polyfills if available
const polyfillSupport = DEV_MODE
	? global.litHtmlPolyfillSupportDevMode
	: global.litHtmlPolyfillSupport;
polyfillSupport?.(Template, ChildPart);

// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for lit-html usage.
(global.litHtmlVersions ??= []).push("3.2.0");
if (DEV_MODE && global.litHtmlVersions.length > 1) {
	issueWarning(
		"multiple-versions",
		"Multiple versions of Lit loaded. " +
			"Loading multiple versions is not recommended.",
	);
}

/**
 * Renders a value, usually a lit-html TemplateResult, to the container.
 *
 * This example renders the text "Hello, Zoe!" inside a paragraph tag, appending
 * it to the container \`document.body\`.
 *
 * \`\`\`js
 * import {html, render} from 'lit';
 *
 * const name = "Zoe";
 * render(html\`<p>Hello, \${name}!</p>\`, document.body);
 * \`\`\`
 *
 * @param value Any [renderable
 *   value](https://lit.dev/docs/templates/expressions/#child-expressions),
 *   typically a {@linkcode TemplateResult} created by evaluating a template tag
 *   like {@linkcode html} or {@linkcode svg}.
 * @param container A DOM container to render to. The first render will append
 *   the rendered value to the container, and subsequent renders will
 *   efficiently update the rendered value if the same result type was
 *   previously rendered there.
 * @param options See {@linkcode RenderOptions} for options documentation.
 * @see
 * {@link https://lit.dev/docs/libraries/standalone-templates/#rendering-lit-html-templates| Rendering Lit HTML Templates}
 */
const render = (value, container, options) => {
	if (DEV_MODE && container == null) {
		// Give a clearer error message than
		//     Uncaught TypeError: Cannot read properties of null (reading
		//     '_$litPart$')
		// which reads like an internal Lit error.
		throw new TypeError(\`The container to render into may not be \${container}\`);
	}
	const renderId = DEV_MODE ? debugLogRenderId++ : 0;
	const partOwnerNode = options?.renderBefore ?? container;
	// This property needs to remain unminified.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let part = partOwnerNode["_$litPart$"];
	debugLogEvent?.({
		kind: "begin render",
		id: renderId,
		value,
		container,
		options,
		part,
	});
	if (part === undefined) {
		const endNode = options?.renderBefore ?? null;
		// This property needs to remain unminified.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		partOwnerNode["_$litPart$"] = part = new ChildPart(
			container.insertBefore(createMarker(), endNode),
			endNode,
			undefined,
			options ?? {},
		);
	}
	part._$setValue(value);
	debugLogEvent?.({
		kind: "end render",
		id: renderId,
		value,
		container,
		options,
		part,
	});
	return part;
};
if (ENABLE_EXTRA_SECURITY_HOOKS) {
	render.setSanitizer = setSanitizer;
	render.createSanitizer = createSanitizer;
	if (DEV_MODE) {
		render._testOnlyClearSanitizerFactoryDoNotCallOrElse =
			_testOnlyClearSanitizerFactoryDoNotCallOrElse;
	}
}

/**
 * Prevents JSON injection attacks.
 *
 * The goals of this brand:
 *   1) fast to check
 *   2) code is small on the wire
 *   3) multiple versions of Lit in a single page will all produce mutually
 *      interoperable StaticValues
 *   4) normal JSON.parse (without an unusual reviver) can not produce a
 *      StaticValue
 *
 * Symbols satisfy (1), (2), and (4). We use Symbol.for to satisfy (3), but
 * we don't care about the key, so we break ties via (2) and use the empty
 * string.
 */
const brand = Symbol.for("");

/** Safely extracts the string part of a StaticValue. */
const unwrapStaticValue = (value) => {
	if (value?.r !== brand) {
		return undefined;
	}
	return value?.["_$litStatic$"];
};

/**
 * Wraps a string so that it behaves like part of the static template
 * strings instead of a dynamic value.
 *
 * Users must take care to ensure that adding the static string to the template
 * results in well-formed HTML, or else templates may break unexpectedly.
 *
 * Note that this function is unsafe to use on untrusted content, as it will be
 * directly parsed into HTML. Do not pass user input to this function
 * without sanitizing it.
 *
 * Static values can be changed, but they will cause a complete re-render
 * since they effectively create a new template.
 */
const unsafeStatic = (value) => ({
	["_$litStatic$"]: value,
	r: brand,
});
const textFromStatic = (value) => {
	if (value["_$litStatic$"] !== undefined) {
		return value["_$litStatic$"];
	}
	throw new Error(\`Value passed to 'literal' function must be a 'literal' result: \${value}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.\`);
};

/**
 * Tags a string literal so that it behaves like part of the static template
 * strings instead of a dynamic value.
 *
 * The only values that may be used in template expressions are other tagged
 * \`literal\` results or \`unsafeStatic\` values (note that untrusted content
 * should never be passed to \`unsafeStatic\`).
 *
 * Users must take care to ensure that adding the static string to the template
 * results in well-formed HTML, or else templates may break unexpectedly.
 *
 * Static values can be changed, but they will cause a complete re-render since
 * they effectively create a new template.
 */
const literal = (strings, ...values) => ({
	["_$litStatic$"]: values.reduce(
		(acc, v, idx) => acc + textFromStatic(v) + strings[idx + 1],
		strings[0],
	),
	r: brand,
});
const stringsCache = new Map();

/**
 * Wraps a lit-html template tag (\`html\` or \`svg\`) to add static value support.
 */
const withStatic =
	(coreTag) =>
	(strings, ...values) => {
		const l = values.length;
		let staticValue;
		let dynamicValue;
		const staticStrings = [];
		const dynamicValues = [];
		let i = 0;
		let hasStatics = false;
		let s;
		while (i < l) {
			s = strings[i];
			// Collect any unsafeStatic values, and their following template strings
			// so that we treat a run of template strings and unsafe static values as
			// a single template string.
			while (
				i < l &&
				((dynamicValue = values[i]),
				(staticValue = unwrapStaticValue(dynamicValue))) !== undefined
			) {
				s += staticValue + strings[++i];
				hasStatics = true;
			}
			// If the last value is static, we don't need to push it.
			if (i !== l) {
				dynamicValues.push(dynamicValue);
			}
			staticStrings.push(s);
			i++;
		}
		// If the last value isn't static (which would have consumed the last
		// string), then we need to add the last string.
		if (i === l) {
			staticStrings.push(strings[l]);
		}
		if (hasStatics) {
			const key = staticStrings.join("$$lit$$");
			strings = stringsCache.get(key);
			if (strings === undefined) {
				// Beware: in general this pattern is unsafe, and doing so may bypass
				// lit's security checks and allow an attacker to execute arbitrary
				// code and inject arbitrary content.
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				staticStrings.raw = staticStrings;
				stringsCache.set(key, (strings = staticStrings));
			}
			values = dynamicValues;
		}
		return coreTag(strings, ...values);
	};

/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 *
 * Includes static value support from \`lit-html/static.js\`.
 */
const staticHTML = withStatic(html);
const unsafeHTML = (html) => staticHTML\`\${unsafeStatic(html)}\`;
const staticSVG = withStatic(svg);
const unsafeSVG = (svg) => staticSVG\`\${unsafeStatic(svg)}\`;

const helpers = {
	unsafeHTML,
	unsafeStatic,
	staticHTML,
	staticSVG,
	unsafeSVG,
	render,
	html,
	literal,
	svg,
	css,
};

export function css(strings, ...values) {
	return strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");
}

Object.assign(html, helpers);

export const component = html;
export default html;
`,mimeType:"application/javascript",skipSW:!1},"/modules/theme/index.js":{content:`import presetWebFonts from "https://cdn.jsdelivr.net/npm/@unocss/preset-web-fonts/+esm";
import presetWind4 from "https://cdn.jsdelivr.net/npm/@unocss/preset-wind4@66.3.3/+esm";

export default async ({ $APP }) => {
	const generateHslShades = (hue, saturation) => {
		const shades = {};
		const lightnessLevels = [97, 92, 84, 75, 66, 55, 45, 35, 24, 15];
		const shadeKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

		for (let i = 0; i < shadeKeys.length; i++) {
			shades[shadeKeys[i]] =
				\`hsl(\${hue}, \${saturation}, \${lightnessLevels[i]}%)\`;
		}
		shades["DEFAULT"] = shades[500];
		return shades;
	};

	const primary = generateHslShades(198, "100%");
	const secondary = generateHslShades(120, "100%");
	const tertiary = generateHslShades(175, "100%");
	const success = generateHslShades(149, "87%");
	const warning = generateHslShades(32, "100%");
	const danger = generateHslShades(345, "100%");

	const gray = generateHslShades(0, "0%");
	gray.DEFAULT = gray[700];
	const fontFamily = "Manrope";
	window.__unocss = {
		theme: {
			text: {
				color: "var(--color-surface-100)",
			},
			font: {
				family: \`'\${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif\`,
				icon: {
					family: "lucide",
				},
			},
			background: {
				color: "var(--colors-primary-100)",
			},
			colors: {
				primary,
				secondary,
				tertiary,
				success,
				warning,
				danger,
				default: gray,
				surface: gray,
			},
			boxShadow: {
				md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
				lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
			},
		},
		extendTheme: (theme) => $APP.theme.set(theme),
		presets: [
			presetWebFonts({
				provider: "google",
				fonts: {
					sans: fontFamily,
				},
			}),
			presetWind4({ preflights: { theme: true } }),
		],
	};

	await import("https://cdn.jsdelivr.net/npm/@unocss/runtime/core.global.js");

	const globalStyleTag = document.createElement("style");
	globalStyleTag.id = "compstyles";
	document.head.appendChild(globalStyleTag);

	async function loadComponentCSS(file) {
		const css = await $APP.fs.css(file, true);
		if (css) globalStyleTag.textContent += css;
	}

	const ThemeManager = {
		loadComponentCSS,
	};
	$APP.events.on("INIT_APP", () => {
		$APP.fs.css("theme.css", true);
	});
	return ThemeManager;
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/mvc/view/loader.js":{content:`export default async ({ View, ThemeManager, $APP }) => {
	const modulePath = (root = false) =>
		\`\${$APP.settings.basePath}\${root ? "" : "/modules"}\`;
	const componentDefinitions = new Map();
	const componentConstructors = new Map();
	const componentLoadPromises = new Map();

	const resolvePath = (tagName) => {
		if ($APP.components?.[tagName]?.path) return $APP.components[tagName].path;
		const parts = tagName.split("-");
		const moduleName = parts[0];
		const module = $APP.modules[moduleName];
		const componentName = parts.slice(1).join("-");
		if (module)
			return [
				modulePath(module.root),
				module.path ?? moduleName,
				componentName,
			].join("/");
		return [$APP.settings.basePath, tagName].join("/");
	};

	async function loadAndCacheDefinition(tag) {
		if (componentDefinitions.has(tag)) return componentDefinitions.get(tag);

		const path = resolvePath(tag);
		const definition = await $APP.loadDep({ tag, path: \`\${path}.js\` });

		if (!definition) {
			console.warn(
				\`[Loader] No default export found for component \${tag} at \${path}.js\`,
			);
			return null;
		}

		if (!$APP.components[tag]) $APP.components[tag] = {};
		$APP.components[tag].path = path;
		$APP.components[tag].definition = definition;
		componentDefinitions.set(tag, definition);

		return definition;
	}

	async function createAndRegisterComponent(tag, definition) {
		const {
			properties = {},
			icons,
			formAssociated = false,
			css,
			style = false,
			extends: extendsTag,
			types,
			connected,
			disconnected,
			willUpdate,
			firstUpdated,
			updated,
			class: klass,
			...prototypeMethods
		} = definition;

		const BaseClass = extendsTag ? await getComponent(extendsTag) : View;
		if (extendsTag) BaseClass.plugins = [...View.plugins, ...BaseClass.plugins];
		const component = class extends BaseClass {
			static icons = icons;
			static css = css;
			static formAssociated = formAssociated;
			constructor() {
				super();
				if (klass) {
					this.classList.add(...klass.split(" "));
				}
			}

			static properties = (() => {
				const baseProperties = super.properties || {};
				const baseTheme = super.theme || {};
				const merged = { ...baseProperties };
				for (const key of Object.keys(properties)) {
					const config = properties[key];

					if (config.type === "object" && config.properties)
						config.properties = merged[key]?.properties
							? {
									...merged[key]?.properties,
									...config.properties,
								}
							: config.properties;

					merged[key] = merged[key]
						? { ...merged[key], ...config }
						: { ...config };
					if (config.theme) baseTheme[key] = merged[key].theme;
				}
				if (types) baseTheme.types = types;
				super.theme = baseTheme;
				return merged;
			})();
		};
		Object.assign(component.prototype, prototypeMethods);
		component.tag = tag;
		component._attrs = Object.fromEntries(
			Object.keys(component.properties).map((prop) => [
				prop.toLowerCase(),
				prop,
			]),
		);
		component.plugins = [
			...component.plugins.filter(
				(plugin) => !plugin.test || plugin.test({ component: component }),
			),
		];
		component.plugins.push({
			events: { connected, disconnected, willUpdate, firstUpdated, updated },
			name: "base",
		});
		if (!customElements.get(tag) || $APP.settings.preview)
			customElements.define(tag, component);
		if (style)
			ThemeManager.loadComponentCSS(\`\${$APP.components[tag].path}.css\`);
		componentConstructors.set(tag, component);
		return component;
	}

	async function getComponent(tag) {
		tag = tag.toLowerCase();
		if (customElements.get(tag)) {
			if (!componentConstructors.has(tag)) {
				componentConstructors.set(tag, customElements.get(tag));
			}
			return componentConstructors.get(tag);
		}
		if (componentConstructors.has(tag)) return componentConstructors.get(tag);
		if (componentLoadPromises.has(tag)) return componentLoadPromises.get(tag);
		const loadPromise = (async () => {
			try {
				const definition = await loadAndCacheDefinition(tag);
				if (!definition) {
					console.warn(
						\`[Loader] Definition for \${tag} not found after loading.\`,
					);
					return null;
				}
				return await createAndRegisterComponent(tag, definition);
			} catch (error) {
				console.error(\`[Loader] Failed to define component \${tag}:\`, error);
				componentLoadPromises.delete(tag); // Allow retries
				return null;
			}
		})();

		componentLoadPromises.set(tag, loadPromise);
		return loadPromise;
	}

	const define = (...args) => {
		if (typeof args[0] === "string") {
			const tag = args[0].toLowerCase();
			const definition = args[1];
			$APP.hooks.emit("componentAdded", { tag, component: definition });

			if (!$APP.settings.dev) {
				getComponent(tag).catch((e) =>
					console.error(
						\`[Loader] Error during preview definition for \${tag}:\`,
						e,
					),
				);
			}
		} else if (typeof args[0] === "object" && args[0] !== null) {
			Object.entries(args[0]).forEach(([tag, definition]) => {
				define(tag, definition);
			});
		}
	};

	const traverseDOM = async (rootElement = document.body) => {
		if (!rootElement || typeof rootElement.querySelectorAll !== "function")
			return;
		const undefinedElements = rootElement.querySelectorAll(":not(:defined)");
		const tagsToProcess = new Set();
		undefinedElements.forEach((element) => {
			const tagName = element.tagName.toLowerCase();
			if (tagName.includes("-")) tagsToProcess.add(tagName);
		});
		await Promise.allSettled(
			Array.from(tagsToProcess).map((tag) => getComponent(tag)),
		);
	};

	const observeDOMChanges = () => {
		const observer = new MutationObserver(async (mutationsList) => {
			const tagsToProcess = new Set();
			for (const mutation of mutationsList) {
				if (mutation.type !== "childList" || mutation.addedNodes.length === 0)
					continue;
				mutation.addedNodes.forEach((node) => {
					if (node.nodeType !== Node.ELEMENT_NODE) return;
					const processNode = (el) => {
						const tagName = el.tagName.toLowerCase();
						if (
							tagName.includes("-") &&
							!customElements.get(tagName) &&
							!componentLoadPromises.has(tagName)
						)
							tagsToProcess.add(tagName);
					};
					processNode(node);
					if (typeof node.querySelectorAll === "function")
						node.querySelectorAll(":not(:defined)").forEach(processNode);
				});
			}
			if (tagsToProcess.size > 0)
				await Promise.allSettled(
					Array.from(tagsToProcess).map((tag) => getComponent(tag)),
				);
		});
		observer.observe(document.body, { childList: true, subtree: true });
	};

	const init = () => {
		$APP.events.on("INIT_APP", () => {
			traverseDOM(document.body);
			observeDOMChanges();
		});
	};

	if ($APP.settings.dev) $APP.hooks.on("init", init);

	$APP.hooks.set({
		componentAdded({ tag, component: definition }) {
			if (!componentDefinitions.has(tag)) {
				componentDefinitions.set(tag, definition);
			}
			if (!$APP.components[tag]) $APP.components[tag] = {};
			$APP.components[tag].definition = definition;
		},
		moduleAdded({ module }) {
			if (module.components) {
				Object.entries(module.components).forEach(([name, value]) => {
					if (Array.isArray(value)) {
						value.forEach((componentName) => {
							const tag = \`\${module.name}-\${componentName}\`;
							if (!$APP.components[tag]) $APP.components[tag] = {};
							$APP.components[tag].path =
								\`\${modulePath(module.root)}/\${module.name}/\${name}/\${componentName}\`;
						});
					} else {
						const tag = \`\${module.name}-\${name}\`;
						if (!$APP.components[tag]) $APP.components[tag] = {};
						$APP.components[tag].path =
							\`\${modulePath(module.root)}/\${module.name}/\${name}\`;
					}
				});
			}
		},
	});

	$APP.define = define;
	return { define };
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/sw/index.js":{content:`export default ({ $APP }) => {
	$APP.addModule({
		name: "sw",
	});

	$APP.addModule({ name: "swEvents" });
	const pendingSWRequests = {};

	const handleSWMessage = async (message = {}) => {
		const { data } = message;
		const { eventId, type, payload } = data;
		if (eventId && pendingSWRequests[eventId]) {
			try {
				pendingSWRequests[eventId].resolve(payload);
			} catch (error) {
				pendingSWRequests[eventId].reject(new Error(error));
			} finally {
				delete pendingSWRequests[eventId];
			}
			return;
		}

		const handler = $APP.swEvents[type];
		if (handler) await handler({ payload });
	};

	navigator.serviceWorker.onmessage = handleSWMessage;

	navigator.serviceWorker.onmessageerror = (e) => {
		console.error(e);
	};

	const postMessageToSW = (params) =>
		navigator.serviceWorker.controller.postMessage(params);

	const requestToSW = (type, payload = {}) => {
		const eventId =
			Date.now().toString() + Math.random().toString(36).substr(2, 9);
		return new Promise((resolve, reject) => {
			pendingSWRequests[eventId] = { resolve, reject };
			postMessageToSW({
				type,
				payload,
				eventId,
			});
		});
	};

	$APP.swEvents.set({
		"SW:REQUEST_DATA_SYNC": ({ payload }) => {
			const { model, key, data } = payload;
			const DataModal = $APP.Model[model];
			if (DataModal) {
				DataModal.emit(key, data);
			}
		},
	});

	return { postMessage: postMessageToSW, request: requestToSW };
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/mvc/controller/backend/index.js":{content:`export default ({ View, $APP }) => {
	let appWorker;
	let wwPort;
	const pendingRequests = {};

	const handleWWMessage = async (message = {}) => {
		const { data } = message;
		const { eventId, type, payload, connection } = data;
		const handler = $APP.events[type];
		let response = payload;
		const respond =
			eventId &&
			((responsePayload) =>
				wwPort.postMessage({
					eventId,
					payload: responsePayload,
					connection,
				}));
		if (handler) response = await handler({ respond, payload, eventId });
		if (eventId && pendingRequests[eventId]) {
			try {
				pendingRequests[data.eventId].resolve(response);
			} catch (error) {
				pendingRequests[data.eventId].reject(new Error(error));
			} finally {
				delete pendingRequests[eventId];
			}
			return;
		}
		if (respond) return respond(response);
	};

	const initBackend = async () => {
		appWorker = new Worker(
			\`/worker.js?project=\${encodeURIComponent(JSON.stringify($APP.settings))}\`,
			{ type: "module" },
		);
		const wwChannel = new MessageChannel();
		wwPort = wwChannel.port1;
		wwPort.onmessage = handleWWMessage;
		wwPort.onmessageerror = (e) => {
			console.error(e);
		};
		appWorker.postMessage({ type: "INIT_PORT" }, [wwChannel.port2]);
		const { user, device, app, models } = await backend("INIT_APP");
		$APP.models.set(models);
		$APP.events.emit("INIT_APP", { user, device, app });
		$APP.about = { user, device, app };

		await navigator.storage.persist();
	};

	const postMessageToPort = (port, params, retryFn) => {
		if (!port) {
			setTimeout(() => retryFn(params), 100);
			return;
		}
		port.postMessage(params);
	};

	const postMessageToWW = (params) =>
		postMessageToPort(wwPort, params, postMessageToWW);

	const backend = (type, payload = {}, connection = null) => {
		const eventId =
			Date.now().toString() + Math.random().toString(36).substr(2, 9);
		const params = { type, payload, eventId };
		return new Promise((resolve, reject) => {
			if (connection) params.connection = connection;
			pendingRequests[eventId] = { resolve, reject };
			postMessageToWW(params);
		});
	};

	$APP.hooks.on("init", initBackend);

	const requestDataSync = ({ instance }) => {
		const {
			id,
			model,
			limit,
			offset = 0,
			includes,
			recursive,
			order,
			filter,
			key,
		} = instance._data;
		const method = instance._data.method ?? (id ? "get" : "getMany");
		const isMany = method === "getMany";
		const opts = { limit, offset, order, recursive };
		if (filter) opts.filter = filter;
		if (includes)
			opts.includes = Array.isArray(includes) ? includes : includes.split(",");

		const onDataLoaded = (res) => {
			if (!isMany) instance[key] = res;
			else {
				instance[key] = res.items ?? res;
				if (res.count) instance._data.count = res.count;
			}
			instance.requestUpdate();
			instance.emit("dataLoaded", {
				instance,
				rows: isMany ? instance[key] : undefined,
				row: !isMany ? instance[key] : undefined,
				component: instance.constructor,
			});
		};

		if (isMany) $APP.Model[model].getAll(opts).then(onDataLoaded);
		else $APP.Model[model].get(id, opts).then(onDataLoaded);
	};

	View.plugins.push({
		name: "dataQuery",
		events: {
			connected: ({ instance }) => {
				if (!instance._data) return;
				instance._listeners = {};
				const { model, id, key } = instance._data;
				const row = instance[key];
				const modelRows = $APP.Model[model]?.rows;
				if (!modelRows) return;
				if (id) {
					const listenerKey = \`get:\${id}\`;
					if (row !== undefined && modelRows[id] === undefined)
						modelRows[id] = row;
					instance._listeners[listenerKey] = () => {
						instance[key] = modelRows[id];
						instance.requestUpdate();
					};
					$APP.Model[model].on(listenerKey, instance._listeners[listenerKey]);
				} else {
					instance._listeners.any = () => requestDataSync({ instance });
					$APP.Model[model].onAny(instance._listeners.any);
				}
				if (!row) requestDataSync({ instance });
				instance.syncable = true;
			},
			disconnected: ({ instance }) => {
				if (!instance._listeners) return;
				Object.entries(instance._listeners).forEach(([key, listener]) => {
					if (!instance?._data?.model || !$APP.Model[instance._data.model])
						return;
					if (key === "any") $APP.Model[instance._data.model].offAny(listener);
					else $APP.Model[instance._data.model].off(key, listener);
				});
			},
		},
	});

	$APP.events.on("INIT_APP", async () => {
		$APP.events.set({
			UPDATE_MODELS: ({ payload: { models } }) => $APP.models.set(models),
			REQUEST_DATA_SYNC: ({ payload: { model, key, data } }) => {
				$APP.Model[model].emit(key, data);
				$APP.SW.request("SW:BROADCAST_DATA_SYNC", { key, model, data });
			},
		});
	});

	return backend;
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/mvc/model/frontend.js":{content:`import Model from "/modules/mvc/model/index.js";
export default ({ Backend }) => {
	const request = (action, modelName, params = {}) => {
		return Backend(action, {
			model: modelName,
			...params,
		});
	};

	Model.request = request;

	return Model;
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/mvc/controller/index.js":{content:`import adaptersStorage from "/modules/mvc/controller/adapter-storage.js";
import adaptersUrl from "/modules/mvc/controller/adapter-url.js";

export default ({ View, $APP, Backend }) => {
	const controllerAdapters = {
		...adaptersStorage,
		...adaptersUrl,
		backend: Backend,
	};

	const parseKey = (key) => {
		if (typeof key === "string" && key.includes(".")) {
			const [storeKey, path] = key.split(".", 2);
			return { storeKey, path };
		}
		return { storeKey: key, path: null };
	};

	const createAdapter = (store, storeName) => {
		const adapter =
			typeof store === "function"
				? store
				: (key, value) =>
						value !== undefined ? adapter.set(key, value) : adapter.get(key);

		$APP.events.install(adapter);

		const notify = (key, value) => {
			Controller[storeName]?.emit(key, value);
		};

		adapter.get = (key) => {
			const { storeKey, path } = parseKey(key);
			const baseValue = store.get(storeKey);
			if (path && typeof baseValue === "object" && baseValue !== null) {
				return baseValue[path];
			}
			return baseValue;
		};

		adapter.set = (key, value) => {
			const { storeKey, path } = parseKey(key);
			if (path) {
				const baseObject = store.get(storeKey) || {};
				const newValue = { ...baseObject, [path]: value };

				store.set(storeKey, newValue);
				notify(storeKey, newValue);
				return newValue;
			}
			store.set(storeKey, value);
			notify(storeKey, value);
			return value;
		};

		adapter.remove = (key) => {
			const { storeKey, path } = parseKey(key);
			if (path) {
				const baseObject = store.get(storeKey);
				if (typeof baseObject === "object" && baseObject !== null) {
					delete baseObject[path];
					store.set(storeKey, baseObject);
					notify(storeKey, baseObject);
				}
				return { key: storeKey };
			}
			store.remove(storeKey);
			notify(storeKey, undefined);
			return { key: storeKey };
		};

		adapter.has = store.has;
		adapter.keys = store.keys;
		adapter.entries = store.entries;

		adapterCache.set(storeName, adapter);
		return adapter;
	};

	const adapterCache = new Map();

	const Controller = new Proxy(
		{},
		{
			get(target, prop) {
				if (prop in target) return target[prop];
				if (adapterCache.has(prop)) return adapterCache.get(prop);
				if (prop in controllerAdapters)
					return createAdapter(controllerAdapters[prop], prop);
				if ($APP.mv3Connections?.includes(prop)) {
					return (type, payload = {}) => {
						const backendAdapter =
							adapterCache.get("backend") ||
							createAdapter(controllerAdapters.backend, "backend");
						return backendAdapter(type, payload, prop);
					};
				}
				return undefined;
			},
		},
	);

	const init = () => {
		$APP.swEvents.set({
			"SW:PROP_SYNC_UPDATE": ({ payload }) => {
				const { sync, key, value } = payload;
				const adapter = Controller[sync];
				if (adapter) {
					console.log(\`SYNC: Received update for \${sync}.\${key}\`, value);
					adapter.emit(key, value, { skipBroadcast: true });
				}
			},
		});
		const syncUrlAdapter = (adapterName) => {
			const adapter = Controller[adapterName];
			const newEntries = new Map(adapter.entries());
			const oldKeys = new Set(adapter.listeners.keys());

			newEntries.forEach((value, key) => {
				adapter.emit(key, value);
				oldKeys.delete(key);
			});

			oldKeys.forEach((key) => adapter.emit(key, undefined));
		};

		window.addEventListener("popstate", () => {
			syncUrlAdapter("querystring");
			syncUrlAdapter("hash");
		});
	};

	$APP.hooks.on("init", init);

	const getScopedKey = (baseKey, prop, instance) => {
		if (prop.scope) {
			if (prop.scope.includes(".")) {
				const [obj, objProp] = prop.scope.split(".");
				if (instance[obj]?.[objProp])
					return \`\${instance[obj]?.[objProp]}:\${baseKey}\`;
			}

			if (instance[prop.scope]) return \`\${instance[prop.scope]}:\${baseKey}\`;
		}
		return baseKey;
	};

	const SW_SYNCED_ADAPTERS = ["local", "session"];

	View.plugins.push({
		name: "syncProps",
		test: ({ component }) =>
			Object.entries(component.properties || {}).some(([, prop]) => prop.sync),
		events: {
			disconnected: ({ instance }) => {
				if (!instance._listeners) return;
				Object.entries(instance._listeners).forEach(([adapterName, fns]) => {
					const adapter = Controller[adapterName];
					if (adapter)
						Object.entries(fns).forEach(([key, fn]) => adapter.off(key, fn));
				});
			},
			connected: ({ instance, component }) => {
				Object.entries(component.properties)
					.filter(([, prop]) => prop.sync)
					.forEach(([key, prop]) => {
						const adapter = Controller[prop.sync];
						if (!adapter) return;
						const scopedKey = getScopedKey(key, prop, instance);
						const initialValue = adapter.get(scopedKey);
						if (
							SW_SYNCED_ADAPTERS.includes(prop.sync) &&
							!adapter.hasListeners(scopedKey)
						) {
							adapter.on(scopedKey, (value, opts = {}) => {
								if (opts.skipBroadcast) return;
								$APP.SW.request("SW:BROADCAST_SYNCED_PROP", {
									value,
									sync: prop.sync,
									key: scopedKey,
								});
							});
						}

						const eventFn = (value) => {
							instance.state[key] = value;
							instance.requestUpdate(key, "$$");
						};

						if (!instance._listeners) instance._listeners = {};
						if (!instance._listeners[prop.sync])
							instance._listeners[prop.sync] = {};
						instance._listeners[prop.sync][scopedKey] = eventFn;

						if (!Object.getOwnPropertyDescriptor(instance, key)) {
							Object.defineProperty(instance, key, {
								get: () => instance.state[key],
								set: (newValue) => {
									if (instance.state[key] === newValue) return;
									instance.state[key] = newValue;
									if (newValue !== adapter.get(scopedKey)) {
										adapter.set(scopedKey, newValue);
									}
								},
							});
						}
						adapter.on(scopedKey, eventFn);
						eventFn(initialValue ?? prop.defaultValue);
					});
			},
		},
	});

	$APP.Controller = Controller;
	return Controller;
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/mvc/controller/adapter-storage.js":{content:`const serialize = (value) => {
	if ((typeof value === "object" && value !== null) || Array.isArray(value)) {
		return JSON.stringify(value);
	}
	return value;
};

const deserialize = (value) => {
	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
};

const get = (storage) => (key) => {
	const value = storage.getItem(key);
	return value !== null ? deserialize(value) : null;
};

const set = (storage) => (key, value) => {
	storage.setItem(key, serialize(value));
	return { key };
};

const remove = (storage) => (key) => {
	storage.removeItem(key);
	return { key };
};
const keys = (storage) => () => {
	return Object.keys(storage);
};

const has = (storage) => (key) => {
	return storage.getItem(key) !== null && storage.getItem(key) !== undefined;
};

const createStorageAdapter = (storage) => {
	return {
		has: has(storage),
		set: set(storage),
		remove: remove(storage),
		get: get(storage),
		keys: keys(storage),
	};
};

const ramStore = new Map();
const ram = {
	has: (key) => {
		return ramStore.has(key);
	},
	get: (key) => {
		return ramStore.get(key);
	},
	set: (key, value) => {
		ramStore.set(key, value);
		return { key };
	},
	remove: (key) => {
		ramStore.delete(key);
		return { key };
	},
	keys: () => ramStore.keys(),
};

const local = createStorageAdapter(window.localStorage);
const session = createStorageAdapter(window.sessionStorage);

export default { local, ram, session };
`,mimeType:"application/javascript",skipSW:!1},"/modules/mvc/controller/adapter-url.js":{content:`const getHashParams = () => {
	const hash = window.location.hash.substring(1);
	return new URLSearchParams(hash);
};

const setHashParams = (params) => {
	const newHash = params.toString();
	window.location.hash = newHash;
};

const hash = {
	get: (key) => {
		const params = getHashParams();
		return params.get(key);
	},
	has: (key) => {
		const params = getHashParams();
		return params.has(key);
	},
	set: (key, value) => {
		const params = getHashParams();
		params.set(key, value);
		setHashParams(params);
		window.dispatchEvent(new Event("popstate"));
		return { key };
	},
	remove: (key) => {
		const params = getHashParams();
		params.delete(key);
		setHashParams(params);
		return { key };
	},
	keys: () => {
		const params = getHashParams();
		return [...params.keys()];
	},
	entries: () => {
		const params = getHashParams();
		return [...params.entries()];
	},
};

const querystring = {
	get(key) {
		const params = new URLSearchParams(window.location.search);
		return params.get(key);
	},

	set(key, value) {
		const params = new URLSearchParams(window.location.search);
		params.set(key, value);
		window.history?.pushState?.(
			{},
			"",
			\`\${window.location.pathname}?\${params}\`,
		);
		window.dispatchEvent(new Event("popstate"));
		return { key };
	},

	remove(key) {
		const params = new URLSearchParams(window.location.search);
		params.delete(key);
		window.history.pushState?.({}, "", \`\${window.location.pathname}?\${params}\`);
		return { key };
	},
	keys() {
		const params = new URLSearchParams(window.location.search);
		return [...params.keys()];
	},
	has(key) {
		const params = new URLSearchParams(window.location.search);
		return params.has(key);
	},
	entries: () => {
		const params = new URLSearchParams(window.location.search);
		return [...params.entries()];
	},
};

export default { querystring, hash };
`,mimeType:"application/javascript",skipSW:!1},"/modules/router/index.js":{content:`/**
 * @file Application Router
 * @description A client-side router that supports nested routes, route parameters, and history management.
 * It is designed to work with a component-based architecture where parent routes can provide layout components
 * for their children.
 */
export default ({ html, Controller, $APP }) => {
	class Router {
		static stack = [];
		static routes = {};
		static namedRoutes = {};
		static currentRoute = {};

		/**
		 * Recursively flattens the nested route configuration into a single-level map.
		 * It preserves the parent-child relationship in each route object.
		 * @param {object} routes - The nested routes object to process.
		 * @param {string} [basePath=''] - The base path from the parent route.
		 * @param {object} [parentRoute=null] - The parent route object.
		 * @returns {{flatRoutes: object, namedRoutes: object}} - The flattened routes and named routes maps.
		 */
		static flattenRoutes(routes, basePath = "", parentRoute = null) {
			const flatRoutes = {};
			const namedRoutes = {};

			for (const path in routes) {
				const route = { ...routes[path] };
				const fullPath = (basePath + path).replace(/\\/+/g, "/") || "/";

				route.path = fullPath;
				route.parent = parentRoute;

				flatRoutes[fullPath] = route;

				if (route.name) {
					if (namedRoutes[route.name]) {
						console.warn(
							\`Router Warning: Duplicate route name "\${route.name}". The path "\${fullPath}" will be used.\`,
						);
					}
					namedRoutes[route.name] = fullPath;
				}

				// If the route has children, flatten them recursively
				if (route.routes) {
					const { flatRoutes: childFlatRoutes, namedRoutes: childNamedRoutes } =
						this.flattenRoutes(route.routes, fullPath, route);
					Object.assign(flatRoutes, childFlatRoutes);
					Object.assign(namedRoutes, childNamedRoutes);
				}
			}
			return { flatRoutes, namedRoutes };
		}

		/**
		 * Initializes the router with the application's routes.
		 * @param {object} routes - The main routes configuration.
		 * @param {string} [defaultTitle=''] - The default document title.
		 */
		static init(routes, defaultTitle) {
			if (!Object.keys(routes).length) {
				return console.error("Error: no routes loaded");
			}

			const { flatRoutes, namedRoutes } = this.flattenRoutes(routes);
			this.routes = flatRoutes;
			this.namedRoutes = namedRoutes;
			this.defaultTitle = defaultTitle;

			window.addEventListener("popstate", () => {
				// \u2705 FIX: Use the full URL including hash for history navigation.
				const currentPath =
					window.location.pathname +
					window.location.search +
					window.location.hash;
				this.handleHistoryNavigation(currentPath);
			});

			// \u2705 FIX: Use the full URL including hash for the initial route.
			const initialPath =
				window.location.pathname +
				window.location.search +
				window.location.hash;
			this.setCurrentRoute(
				initialPath,
				false, // Do not push to stack on initial load, as the page is already there.
			);
		}

		static handleHistoryNavigation(path) {
			// \u2705 FIX: This logic is now cleaner. We just need to find the route and update the view,
			// without pushing to history again. \`setCurrentRoute\` with \`pushToStack=false\` handles this.
			const stackIndex = this.stack.findIndex(
				(item) => this.normalizePath(item.path) === this.normalizePath(path),
			);

			if (stackIndex !== -1) {
				this.truncateStack(stackIndex);
			}

			this.setCurrentRoute(path, false);
		}

		/**
		 * Generates a URL path for a named route with the given parameters.
		 * @param {string} routeName - The name of the route.
		 * @param {object} [params={}] - The parameters to fill in the path.
		 * @returns {string|null} The generated path or null if an error occurs.
		 */
		static create(routeName, params = {}) {
			const pathPattern = this.namedRoutes[routeName];
			if (!pathPattern) {
				console.error(
					\`Router Error: Route with name "\${routeName}" not found.\`,
				);
				return null;
			}

			const path = pathPattern.replace(/:(\\w+)/g, (match, paramName) => {
				if (params[paramName] !== undefined && params[paramName] !== null) {
					return String(params[paramName]);
				}
				console.warn(
					\`Router Warning: Parameter "\${paramName}" was not provided for named route "\${routeName}".\`,
				);
				return match;
			});

			if (path.includes(":")) {
				console.error(
					\`Router Error: Could not create path for "\${routeName}". Final path still contains unresolved parameters: \${path}\`,
				);
				return null;
			}
			return path;
		}

		static replace(path, state = {}) {
			const currentState = window.history.state || {};
			const newState = { ...currentState, ...state };
			window.history.replaceState(newState, "", path);
		}

		/**
		 * Navigates to a given route.
		 * @param {string} routeNameOrPath - The path or the name of the route to navigate to.
		 * @param {object} [params] - Route parameters if navigating by name.
		 */
		static go(routeNameOrPath, params) {
			if (params) {
				const path = this.create(routeNameOrPath, params);
				if (path) this.setCurrentRoute(path, true);
				return;
			}
			this.setCurrentRoute(routeNameOrPath, true);
		}

		static home() {
			this.stack = [];
			this.go("/");
		}

		static back() {
			if (this.stack.length <= 1) {
				this.home();
				return;
			}
			this.stack.pop();
			window.history.back();
		}

		static pushToStack(path, params = {}, title = this.defaultTitle) {
			if (path === "/") {
				this.stack = [{ path, params, title }];
			} else {
				this.stack.push({ path, params, title });
			}
			this.setTitle(
				title ? \`\${title} | \${$APP.settings.name}\` : $APP.settings.name,
			);
		}

		static isRoot() {
			return this.stack.length <= 1;
		}

		static truncateStack(index = 0) {
			if (index >= this.stack.length) return;
			this.stack = this.stack.slice(0, index + 1);
		}

		static normalizePath(path = "/") {
			const normalized = path.includes("url=")
				? path.split("url=")[1]
				: path.split("?")[0].split("#")[0]; // \u2705 FIX: Also split by hash for matching
			return (normalized || "/").replace(/\\/+$/, "") || "/";
		}

		static push(path, state = {}) {
			window.history.pushState(state, "", path);
		}

		/**
		 * Matches a URL path against the route configuration and sets it as the current route.
		 * @param {string} path - The URL path to navigate to.
		 * @param {boolean} [pushToStack=true] - Whether to push the new route onto the history stack.
		 */
		static setCurrentRoute(path, pushToStack = true) {
			if (!this.routes) return;

			// \u2705 FIX: Prevent pushing a new history state if the URL is identical to the current one.
			const currentFullUrl =
				window.location.pathname +
				window.location.search +
				window.location.hash;
			if (pushToStack && path === currentFullUrl) {
				return;
			}

			// \u2705 FIX: Parse the querystring and hash from the full path.
			const url = new URL(path, window.location.origin);
			const querystring = url.search;
			const hash = url.hash;

			const normalizedPath = this.normalizePath(path);
			const matched = this.matchRoute(normalizedPath);

			if (!matched) {
				// On initial load, a missing match shouldn't redirect, just warn.
				if (!pushToStack) {
					console.warn(
						\`Router Warning: No route found for initial path "\${path}"\`,
					);
					return;
				}
				return this.go("/");
			}

			// \u2705 FIX: Add the parsed parts and the full path to the matched object.
			matched.path = path;
			matched.querystring = querystring;
			matched.hash = hash;

			if (matched.route.action) return matched.route.action();
			this.updateCurrentRouteInRam(matched);

			if (pushToStack) {
				this.pushToStack(
					path, // \u2705 FIX: Use the full, original path.
					matched.params,
					matched.route.title || this.defaultTitle,
				);
				this.push(path, { path: path }); // \u2705 FIX: Use the full, original path.
			}
		}

		/**
		 * Finds the route that matches the given URL, including its layout component.
		 * @param {string} url - The URL to match.
		 * @returns {object|null} A match object or null if no route is found.
		 */
		static matchRoute(path) {
			for (const routePath in this.routes) {
				const route = this.routes[routePath];
				const paramNames = [];
				const regexPath = route.path.replace(/:([^/]+)/g, (_, paramName) => {
					paramNames.push(paramName);
					return "([^/]+)";
				});

				const regex = new RegExp(\`^\${regexPath}$\`);
				const match = path.match(regex);

				if (match) {
					const params = {};
					paramNames.forEach((name, index) => {
						params[name] = match[index + 1];
					});
					console.log(params);
					if (route.parent) {
						return {
							params,
							path,
							name: route.name,
							route: route.parent,
							template: route.parent.template,
							component: route.parent.component,
							matched: {
								route: route.parent,
								params,
								path: route.path,
								name: route.name,
								component: route.component(params),
								template: route.template,
							},
						};
					}

					return {
						route,
						params,
						path,
						name: route.name,
						component: route.component,
						template: route.template,
					};
				}
			}
			return null;
		}

		static setTitle(newTitle) {
			document.title = newTitle;
			if (this.stack.length > 0) {
				this.stack.at(-1).title = newTitle;
			}
			if (this.currentRoute?.route) {
				this.currentRoute.route.title = newTitle;
				Controller.ram.set("currentRoute", { ...this.currentRoute });
			}
		}

		static updateCurrentRouteInRam(route) {
			this.currentRoute = route;
			this.currentRoute.root = this.isRoot();
			Controller.ram.set("currentRoute", this.currentRoute);
		}
	}

	const init = () => {
		Router.init($APP.routes);
	};

	$APP.hooks.on("init", init);
	$APP.routes.set({ "/": { component: () => html\`<app-index></app-index>\` } });

	$APP.addModule({ name: "router" });

	return Router;
};
`,mimeType:"application/javascript",skipSW:!1},"/index.js":{content:`export default ({ $APP, Model, T, html }) => {
	$APP.events.on("INIT_APP", async () => {
		$APP.define("app-quick-add-buttons", {
			properties: {
				customAmount: T.string(""),
				isCustomOpen: T.boolean(false),
				celebrateCount: T.number(0),
				animatingButton: T.string(""),
			},

			async addPushups(count, buttonId) {
				this.animatingButton = buttonId;
				this.celebrateCount = count;

				const today = new Date().toISOString().split("T")[0];
				await Model.sessions.add({
					count: count,
					date: today,
					timestamp: new Date().toISOString(),
				});

				setTimeout(() => {
					this.celebrateCount = 0;
					this.animatingButton = "";
				}, 1000);
			},

			async addCustom() {
				const amount = Number.parseInt(this.customAmount);
				if (amount > 0) {
					await this.addPushups(amount, "custom");
					this.customAmount = "";
					this.isCustomOpen = false;
				}
			},

			render() {
				return html\`
                <div class="bg-white border-4 border-black rounded-none p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-visible">
                    <h2 class="text-xl sm:text-2xl font-black mb-4 sm:mb-6 uppercase">Add Pushups</h2>
                    
                    \${
											this.celebrateCount > 0
												? html\`
                        <div class="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
                            <div class="text-6xl sm:text-8xl font-black animate-bounce text-green-500" 
                                 style="animation: celebrate 1s ease-out; text-shadow: 4px 4px 0px rgba(0,0,0,1);">
                                +\${this.celebrateCount}
                            </div>
                        </div>
                        <style>
                            @keyframes celebrate {
                                0% { transform: scale(0) rotate(-180deg); opacity: 0; }
                                50% { transform: scale(1.3) rotate(10deg); opacity: 1; }
                                100% { transform: scale(1) rotate(0deg); opacity: 0; }
                            }
                        </style>
                    \`
												: ""
										}
                    
                    <div class="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                        <button 
                            @click=\${() => this.addPushups(1, "btn1")}
                            class="bg-yellow-400 border-4 border-black font-black text-xl py-4 sm:text-2xl sm:py-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:bg-yellow-500 \${this.animatingButton === "btn1" ? "animate-pulse scale-110" : ""}"
                        >
                            +1
                        </button>
                        <button 
                            @click=\${() => this.addPushups(5, "btn5")}
                            class="bg-pink-400 border-4 border-black font-black text-xl py-4 sm:text-2xl sm:py-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:bg-pink-500 \${this.animatingButton === "btn5" ? "animate-pulse scale-110" : ""}"
                        >
                            +5
                        </button>
                        <button 
                            @click=\${() => this.addPushups(10, "btn10")}
                            class="bg-green-400 border-4 border-black font-black text-xl py-4 sm:text-2xl sm:py-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:bg-green-500 \${this.animatingButton === "btn10" ? "animate-pulse scale-110" : ""}"
                        >
                            +10
                        </button>
                    </div>

                    \${
											this.isCustomOpen
												? html\`
                            <div class="bg-blue-100 border-4 border-black p-4">
                                <uix-form .submit=\${this.addCustom.bind(this)}>
                                    <div class="flex gap-2">
                                        <input 
                                            type="number" 
                                            .value=\${this.customAmount}
                                            @input=\${(e) => (this.customAmount = e.target.value)}
                                            placeholder="Amount"
                                            class="flex-1 border-4 border-black px-3 py-2 font-bold text-lg sm:text-xl w-full"
                                        />
                                        <button 
                                            type="submit"
                                            class="bg-blue-400 border-4 border-black px-6 font-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all \${this.animatingButton === "custom" ? "animate-pulse scale-110" : ""}"
                                        >
                                            ADD
                                        </button>
                                    </div>
                                </uix-form>
                            </div>
                        \`
												: html\`
                            <button 
                                @click=\${() => (this.isCustomOpen = true)}
                                class="w-full bg-blue-400 border-4 border-black font-black py-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                CUSTOM AMOUNT
                            </button>
                        \`
										}
                </div>
            \`;
			},
		});

		/**
		 * Component: app-daily-total
		 * Shows today's total pushups
		 */
		$APP.define("app-daily-total", {
			properties: { rows: T.array() },
			getTodayTotal() {
				if (!this.rows) return 0;
				const today = new Date().toISOString().split("T")[0];
				return this.rows
					.filter((session) => session.date === today)
					.reduce((sum, session) => sum + session.count, 0);
			},

			render() {
				if (!this.rows) return html\`<uix-spinner></uix-spinner>\`;

				const total = this.getTodayTotal();

				return html\`
                <div class="bg-gradient-to-br from-yellow-300 to-yellow-400 border-4 border-black rounded-none p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
                    <div class="text-sm font-black uppercase mb-2">Today's Total</div>
                    <div class="text-6xl sm:text-7xl font-black mb-2">\${total}</div>
                    <div class="text-lg sm:text-xl font-black uppercase">Pushups</div>
                </div>
            \`;
			},
		});

		/**
		 * Component: app-progress-to-1k
		 * Visual progress bar to 1000 pushups
		 */
		$APP.define("app-progress-to-1k", {
			properties: { rows: T.array() },
			getLifetimeTotal() {
				if (!this.rows) return 0;
				return this.rows.reduce((sum, session) => sum + session.count, 0);
			},

			getMilestone() {
				const total = this.getLifetimeTotal();
				if (total >= 1000) return { next: 1000, current: 1000 };
				return { next: 1000, current: total };
			},

			render() {
				if (!this.rows) return html\`<uix-spinner></uix-spinner>\`;

				const milestone = this.getMilestone();
				const percentage = (milestone.current / milestone.next) * 100;

				return html\`
                <div class="bg-white border-4 border-black rounded-none p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                        <h2 class="text-xl sm:text-2xl font-black uppercase">Progress to 1K</h2>
                        <div class="text-xl sm:text-2xl font-black">\${milestone.current} / \${milestone.next}</div>
                    </div>
                    
                    <div class="bg-gray-200 border-4 border-black h-12 sm:h-16 relative overflow-hidden">
                        <div 
                            class="bg-gradient-to-r from-green-400 to-green-500 h-full border-r-4 border-black transition-all duration-500"
                            style="width: \${percentage}%"
                        ></div>
                        <div class="absolute inset-0 flex items-center justify-center font-black text-xl sm:text-2xl">
                            \${Math.round(percentage)}%
                        </div>
                    </div>

                    \${
											milestone.current >= 1000
												? html\`
                            <div class="mt-4 bg-yellow-300 border-4 border-black p-4 text-center">
                                <div class="text-2xl sm:text-3xl font-black">\u{1F389} MILESTONE REACHED! \u{1F389}</div>
                                <div class="text-md sm:text-lg font-bold mt-2">You hit 1000 pushups!</div>
                            </div>
                        \`
												: ""
										}
                </div>
            \`;
			},
		});

		/**
		 * Component: app-recent-sessions
		 * List of recent pushup sessions
		 */
		$APP.define("app-recent-sessions", {
			properties: { rows: T.array() },
			async deleteSession(id) {
				// Note: confirm() can be disruptive. For a real app, a custom modal is better.
				if (confirm("Delete this session?")) {
					await Model.sessions.remove(id);
				}
			},

			formatTime(timestamp) {
				const date = new Date(timestamp);
				return date.toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				});
			},

			render() {
				if (!this.rows) return html\`<uix-spinner></uix-spinner>\`;

				const sessions = [...this.rows]
					.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
					.slice(0, 10);

				return html\`
                <div class="bg-white border-4 border-black rounded-none p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 class="text-xl sm:text-2xl font-black mb-4 uppercase">Recent Sessions</h2>
                    
                    <div class="space-y-2">
                        \${
													sessions.length === 0
														? html\`
                                <div class="text-center text-gray-500 font-bold py-8">
                                    No sessions yet. Start pushing!
                                </div>
                            \`
														: sessions.map(
																(session) => html\`
                                    <div class="flex justify-between items-center bg-gray-100 border-2 border-black p-3">
                                        <div class="flex items-center gap-3 sm:gap-4">
                                            <div class="bg-pink-400 border-2 border-black px-3 py-1 sm:px-4 sm:py-2 font-black text-lg sm:text-xl">
                                                \${session.count}
                                            </div>
                                            <div>
                                                <div class="font-bold text-sm sm:text-base">\${session.date}</div>
                                                <div class="text-xs sm:text-sm">\${this.formatTime(session.timestamp)}</div>
                                            </div>
                                        </div>
                                        <button 
                                            @click=\${() => this.deleteSession(session.id)}
                                            class="bg-red-400 border-2 border-black px-3 py-2 font-black hover:bg-red-500"
                                        >
                                            \u2715
                                        </button>
                                    </div>
                                \`,
															)
												}
                    </div>
                </div>
            \`;
			},
		});

		/**
		 * Component: app-stats-grid
		 * Shows various statistics
		 */
		$APP.define("app-stats-grid", {
			properties: { rows: T.array() },
			getStats() {
				if (!this.rows || this.rows.length === 0) {
					return {
						totalPushups: 0,
						totalSessions: 0,
						avgPerSession: 0,
						bestDay: 0,
					};
				}

				const totalPushups = this.rows.reduce((sum, s) => sum + s.count, 0);
				const totalSessions = this.rows.length;
				const avgPerSession = Math.round(totalPushups / totalSessions);

				const dayTotals = {};
				this.rows.forEach((session) => {
					if (!dayTotals[session.date]) dayTotals[session.date] = 0;
					dayTotals[session.date] += session.count;
				});
				const bestDay = Math.max(...Object.values(dayTotals), 0);

				return { totalPushups, totalSessions, avgPerSession, bestDay };
			},

			render() {
				if (!this.rows) return html\`<uix-spinner></uix-spinner>\`;

				const stats = this.getStats();

				return html\`
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-blue-300 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                        <div class="text-3xl sm:text-4xl font-black mb-2">\${stats.totalPushups}</div>
                        <div class="font-black uppercase text-xs sm:text-sm">Total Pushups</div>
                    </div>
                    <div class="bg-orange-300 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                        <div class="text-3xl sm:text-4xl font-black mb-2">\${stats.totalSessions}</div>
                        <div class="font-black uppercase text-xs sm:text-sm">Sessions</div>
                    </div>
                    <div class="bg-pink-300 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                        <div class="text-3xl sm:text-4xl font-black mb-2">\${stats.avgPerSession}</div>
                        <div class="font-black uppercase text-xs sm:text-sm">Avg/Session</div>
                    </div>
                    <div class="bg-green-300 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                        <div class="text-3xl sm:text-4xl font-black mb-2">\${stats.bestDay}</div>
                        <div class="font-black uppercase text-xs sm:text-sm">Best Day</div>
                    </div>
                </div>
            \`;
			},
		});

		$APP.define("app-index", {
			properties: {
				// Default the active tab to "main" so the workout screen shows on load.
				activeTab: T.string("main"),
			},
			class: "w-full",
			render() {
				return html\`
            <div class="min-h-screen bg-yellow-50 p-4 sm:p-6 md:p-8 font-sans">
                <div class="w-full md:max-w-4xl mx-auto space-y-4 sm:space-y-6">
                    <header class="text-center mb-6 sm:mb-8">
                        <h1 class="text-4xl sm:text-6xl md:text-7xl font-black mb-4 uppercase transform -rotate-2">
                            <span class="inline-block bg-pink-400 border-4 border-black px-4 py-2 sm:px-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                1K PUSHUPS
                            </span>
                        </h1>
                        <p class="sm:text-xl font-bold">Track your way to 1,000 pushups!</p>
                    </header>
                    <app-daily-total ._data=\${{ model: "sessions", key: "rows" }}></app-daily-total>
                    

                    \${
											this.activeTab === "main"
												? html\`
                            <div class="space-y-4 sm:space-y-6">
                                <app-quick-add-buttons></app-quick-add-buttons>
                                <app-progress-to-1k ._data=\${{ model: "sessions", key: "rows" }}></app-progress-to-1k>
                            </div>\`
												: ""
										}
                    \${
											this.activeTab === "stats"
												? html\`<app-stats-grid ._data=\${{ model: "sessions", key: "rows" }}></app-stats-grid>\`
												: ""
										}
                    \${
											this.activeTab === "history"
												? html\`<app-recent-sessions ._data=\${{ model: "sessions", key: "rows" }}></app-recent-sessions>\`
												: ""
										}
                                        <div class="flex border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <button
                            @click=\${() => (this.activeTab = "main")}
                            class="flex-1 p-4 font-black text-xl uppercase transition-all border-r-2 border-black
                                \${
																	this.activeTab === "main"
																		? "bg-yellow-400 text-black"
																		: "bg-white hover:bg-yellow-100"
																}"
                        >
                            \u{1F4AA} Workout
                        </button>
                        <button
                            @click=\${() => (this.activeTab = "stats")}
                            class="flex-1 p-4 font-black text-xl uppercase transition-all border-x-2 border-black
                                \${
																	this.activeTab === "stats"
																		? "bg-blue-400 text-black"
																		: "bg-white hover:bg-blue-100"
																}"
                        >
                            \u{1F4CA} Stats
                        </button>
                        <button
                            @click=\${() => (this.activeTab = "history")}
                            class="flex-1 p-4 font-black text-xl uppercase transition-all border-l-2 border-black
                                \${
																	this.activeTab === "history"
																		? "bg-pink-400 text-black"
																		: "bg-white hover:bg-pink-100"
																}"
                        >
                            \u{1F4D6} History
                        </button>
                    </div>
                </div>
            </div>
        \`;
			},
		});
	});
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/p2p/index.js":{content:`export default ({ $APP }) => {
	const p2p = {};
	$APP.events.install(p2p);
	$APP.addModule({
		name: "p2p",
	});
	const events = {
		"P2P:SEND_DATA_OP": ({ payload }) => {
			console.log("P2P DATA OP", { payload });
			$APP.p2p.emit("SEND_DATA_OP", payload);
		},
	};
	$APP.events.set(events);
	return p2p;
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/apps/admin/index.js":{content:`export const dependencies = {
	//cms: "/modules/apps/cms/index.js",
	//drive: "/modules/apps/drive/index.js",
	//project: "/modules/apps/project/index.js",
	//IDE: "/modules/apps/ide/index.js",
	//editor: "/modules/apps/editor/index.js",
	Bundler: "/modules/apps/bundler/index.js",
	mcp: "/modules/apps/mcp/index.js",
};

export default ({ $APP, html }) => {
	$APP.addModule({
		name: "admin",
		path: "apps/admin/views",
	});

	const routes = {
		"/admin": {
			component: () => html\`<cms-ui directory="admin/cms"></cms-ui>\`,
			title: "Admin",
			template: "admin-template",
		},
		"/admin/cms": {
			component: () => html\`<cms-ui directory="admin/cms"></cms-ui>\`,
			title: "Data",
			template: "admin-template",
		},
		"/admin/ide": {
			component: () =>
				html\`<ide-ui full directory="/projects" hasProject></ide-ui>\`,
			title: "IDE",
			template: "admin-template",
		},
		"/admin/bundler": {
			component: () => html\`<bundler-ui></bundler-ui>\`,
			title: "Bundler",
			template: "admin-template",
		},
		"/admin/project": {
			component: () =>
				html\`<cms-crud
							view="board"
							class="p-8"
							._data=\${{ model: "tasks", key: "rows" }} 
							.allowedActions=\${["import", "export", "changeViewMode", "changeColumns"]}></cms-crud>\`,
			title: "Data",
			template: "admin-template",
		},
		"/admin/design": {
			component: () => html\`<design-ui></design-ui>\`,
			title: "Design",
			template: "admin-template",
		},
		"/admin/design/:component": {
			component: ({ component }) =>
				html\`<design-ui component=\${component}></design-ui>\`,
			title: "Component Design",
			template: "admin-template",
		},
		"/admin/cms/:model": {
			component: ({ model }) =>
				html\`<cms-ui directory="admin/cms" model=\${model}></cms-ui>\`,
			title: "Admin",
			template: "admin-template",
		},
		"/admin/cms/:model/:id": {
			name: "cms_item",
			component: ({ model, id }) =>
				html\`<cms-ui directory="admin/cms" model=\${model} selectedId=\${id}></cms-ui>\`,
			title: "Admin",
			template: "admin-template",
		},
		"/admin/mcp": {
			component: () => html\`<mcp-inspector></mcp-inspector>\`,
			title: "MCP Inspector",
			template: "admin-template",
		},
		"/admin/mcp-dev": {
			component: () => html\`<mcp-dev></mcp-dev>\`,
			title: "Chat",
			template: "admin-template",
		},
		"/admin/mcp-chat": {
			component: () => html\`<mcp-chat></mcp-chat>\`,
			title: "Chat",
			template: "admin-template",
		},
		"/admin/chat": {
			component: () =>
				html\`<app-chat class="flex-1 flex h-screen bg-gray-100 font-sans"></app-chat>\`,
			title: "Data",
			template: "admin-template",
		},
	};

	$APP.routes.set(routes);
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/apps/bundler/index.js":{content:"export default {}"},"/modules/integrations/github.js":{content:"export default {}"},"/modules/apps/mcp/index.js":{content:`export default ({ $APP }) => {
	$APP.addModule({
		name: "mcp",
		path: "apps/mcp/views",
		settings: {
			appbar: {
				label: "MCP Inspector",
				icon: "square-mouse-pointer",
			},
		},
	});

	$APP.addModule({
		name: "mcp-dev",
		settings: {
			appbar: {
				label: "MCP dev",
				icon: "server-cog",
			},
		},
	});

	$APP.addModule({
		name: "mcp-chat",
		settings: {
			appbar: {
				label: "MCP Chat",
				icon: "bot-message-square",
			},
		},
	});
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/uix/index.js":{content:`export default ({ $APP }) => {
	$APP.addModule({
		name: "uix",
		components: {
			form: [
				"form",
				"form-control",
				"input",
				"textarea",
				"time",
				"rating",
				"code",
				"join",
				"file-upload", // \u{1F53A} ToDo
				"number-input", // \u{1F53A} ToDo
				"switch", // \u{1F53A} ToDo
				"slider", // \u{1F53A} ToDo
			],
			navigation: [
				"navbar",
				"breadcrumbs",
				"menu", // \u{1F53A} ToDo (menu dropdown)
				"sidebar", // \u{1F53A} ToDo
				"pagination",
				"tabs",
				"tabbed",
			],
			overlay: [
				"overlay",
				"modal",
				"drawer",
				"tooltip",
				"popover", // \u{1F53A} ToDo
				"alert-dialog", // \u{1F53A} ToDo
				"toast", // \u{1F53A} ToDo
			],
			display: [
				"markdown",
				"editable",
				"link",
				"button",
				"avatar",
				"badge",
				"card",
				"circle",
				"image",
				"pattern",
				"logo",
				"media",
				"table",
				"table-row",
				"icon",
				"calendar",
				"calendar-day",
				"tag", // \u{1F53A} ToDo
				"stat",
				"chart",
			],

			layout: [
				"list",
				"accordion",
				"container",
				"divider",
				"section", // \u{1F53A} ToDo
				"page", // \u{1F53A} ToDo
				"flex", // \u{1F53A} ToDo
				"stack", // \u{1F53A} ToDo
				"spacer", // \u{1F53A} ToDo
			],

			feedback: [
				"spinner",
				"progress-bar", // \u{1F53A} ToDo
				"circular-progress", // \u{1F53A} ToDo
				"skeleton", // \u{1F53A} ToDo
			],

			utility: [
				"darkmode",
				"draggable",
				"droparea",
				"clipboard", // \u{1F53A} ToDo
				"theme-toggle", // \u{1F53A} ToDo
				"dark-mode-switch", // \u{1F53A} ToDo
			],
		},
	});
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/icon-lucide/index.js":{content:`export default ({ $APP }) => {
	$APP.addModule({ name: "icon-lucide", icon: true });
};
`,mimeType:"application/javascript",skipSW:!1},"/worker.js":{content:`import $APP from "/bootstrap.js";

let STARTED;

const bootstrap = async (_project) => {
	console.log("App Worker: bootstrap() called");
	const url = new URL(self.location);
	const param = url.searchParams.get("project");
	const project = param ? JSON.parse(decodeURIComponent(param)) : {};
	project.backend = true;
	const APP = await $APP.bootstrap({
		backend: true,
		...(project || {}),
		dependencies: {
			T: "/modules/types/index.js",
			IndexedDBWrapper: "/modules/mvc/model/indexeddb/index.js",
			Database: "/modules/mvc/model/database/index.js",
			Model: "/modules/mvc/model/backend.js",
			Backend: "/modules/mvc/controller/backend/worker.js",
			"user-migration": "/models/migration.js",
			...(project.dependencies || {}),
		},
		settings: {
			...(project.settings || {}),
			preview: !!self.IS_PREVIEW,
			IS_MV3: !!self.chrome,
		},
	});

	if (APP && !STARTED) {
		console.log("App Worker: Initializing backend application");
		await $APP.Backend.bootstrap(APP);
	}
	return APP;
};
let app;
let commsPort;
const events = [];
const MessageHandler = {
	handleMessage: async ({ data }) => {
		if (data.eventId && events.includes(data.eventId)) return;
		if (data.eventId) events.push(data.eventId);

		const respond =
			data.eventId &&
			((responsePayload) => {
				if (commsPort)
					commsPort.postMessage({
						eventId: data.eventId,
						payload: responsePayload,
						connection: data.connection,
					});
			});

		if ($APP?.Backend) {
			console.info(\`App Worker: Routing message to backend: \${data.type}\`, {
				data,
			});
			$APP.Backend.handleMessage({
				data,
				respond,
			});
		} else {
			$APP.hooks.on("APP:BACKEND_STARTED", async () => {
				console.info(
					\`App Worker: Routing message to backend after APP:BACKEND_STARTED: \${data.type}\`,
				);
				$APP.Backend.handleMessage({
					data,
					respond,
				});
			});
		}
	},
};

self.addEventListener("message", async (event) => {
	if (event.data.type === "INIT_PORT") {
		commsPort = event.ports[0];
		console.warn("App Worker: Communication port initialized.");
		commsPort.onmessage = MessageHandler.handleMessage;
		(async () => {
			app = await bootstrap();
			$APP.Backend.client = commsPort;
		})();
	}
});
`,mimeType:"application/javascript",skipSW:!1},"/bootstrap.js":{content:`import coreModules, {
	installModulePrototype,
} from "/modules/mvc/helpers/core.js";

const prototypeAPP = {
	async loadApp() {
		try {
			const response = await fetch("/package.json");
			if (!response.ok)
				throw new Error(\`HTTP error! status: \${response.status}\`);
			const packageConfig = await response.json();
			await this.bootstrap(packageConfig);
		} catch (error) {
			console.error("Could not load 'package.json'. Bootstrap failed.", {
				error,
			});
		}
	},

	async loadDep({ key, path, name, tag }, isLocals) {
		if (key && this[key]) return;
		const module = await import(path, { tag });
		let locals = {};
		if (module.dependencies) await this.inject(module.dependencies);
		if (module.locals) locals = await this.inject(module.locals, true);

		let instance;

		if (module.component) {
			instance = module.component;
		} else if (name && name in module) {
			const depExport = module[name];
			instance = depExport;
		} else if (typeof module.default === "function")
			instance = module.default({ ...this, $APP: this, ...locals }, locals);
		else instance = module.default;

		if (instance?.constructor === Promise) instance = await instance;

		if (module.migration) {
			if (!this.settings.dependencies) this.settings.dependencies = {};
			this.settings.dependencies[key] = path.replace(
				"index.js",
				"models/migration.js",
			);
		}

		if (key && !isLocals) this[key] = instance;
		if (tag) return instance;
		if (isLocals) return [key, instance];
	},

	addDep(key, dep) {
		this[key] = dep;
	},

	async inject(dependencies, isLocals = false) {
		const locals = [];
		for (const [key, path] of Object.entries(dependencies)) {
			const dep = await this.loadDep(
				{
					key,
					path: Array.isArray(path) ? path[0] : path,
					name: Array.isArray(path) ? path[1] : undefined,
				},
				isLocals,
			);
			if (isLocals && dep && Array.isArray(dep)) locals.push(dep);
		}
		if (isLocals)
			return Object.fromEntries(locals.filter((dep) => Array.isArray(dep)));
	},

	async bootstrap(
		{ dependencies = [], backend = false, settings = {}, theme },
		extraSettings = {},
	) {
		this.settings.set({
			...settings,
			...extraSettings,
			backend,
			frontend: !backend,
		});
		await this.inject(dependencies);
		if (!backend && theme) this.theme.set({ theme });
		this.hooks.emit("init");
		return this;
	},

	addHooks({ hooks, base }) {
		if (!this.hooks) return base;
		if (hooks)
			Object.entries(
				typeof hooks === "function"
					? hooks({ $APP: this, context: base })
					: hooks,
			).map(([name, fn]) => this.hooks.on(name, fn));
	},

	addModule(module) {
		if (
			(module.dev && this.settings.dev !== true) ||
			!!this?.modules?.[module.name]
		)
			return;
		if (!module.base) module.base = {};
		const { alias, name, hooks, beforeSave } = module;
		const base = module.base ?? this[name];
		if (this.modules && !this.modules[name]) this.modules.set(name, module);
		if (module.base) {
			installModulePrototype(base, beforeSave);
			this[name] = base;
			if (alias) this[alias] = base;
		}
		if (hooks) this.addHooks({ hooks, name, base });
		this.hooks
			?.get("moduleAdded")
			.map((fn) => fn.bind(this[module.name])({ module }));
		if (this.log) this.log(\`Module '\${module.name}' added successfully\`);
		return base;
	},
};

const initApp = (prototype = prototypeAPP) => {
	const app = Object.create(prototype);
	for (const moduleName in coreModules) app.addModule(coreModules[moduleName]);
	return app;
};

const $APP = initApp();
self.$APP = $APP;
export default $APP;
`,mimeType:"application/javascript",skipSW:!1},"/modules/mvc/helpers/core.js":{content:`self.sleep = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
export const ArrayStorageFunctions = {
	add: function (...values) {
		values.forEach(
			(value) =>
				!this.includes(value) &&
				this.push(this._beforeSave ? this._beforeSave(value) : value),
		);
		return this;
	},
	remove: function (key) {
		const index = Number.parseInt(key, 10);
		if (!Number.isNaN(index) && index >= 0 && index < this.length)
			this.splice(index, 1);
		return this;
	},
	list: function () {
		return [...this];
	},
	get: function (key) {
		const index = Number.parseInt(key, 10);
		return !Number.isNaN(index) && index >= 0 && index < this.length
			? this[index]
			: undefined;
	},
};

export const ObjectStorageFunctions = {
	set: function (...args) {
		if (args.length === 1 && typeof args[0] === "object" && args[0] !== null)
			Object.entries(args[0]).forEach(([k, v]) => {
				this[k] = this._beforeSave ? this._beforeSave(v) : v;
			});
		else if (args.length === 2 && typeof args[0] === "string") {
			this[args[0]] = this._beforeSave ? this._beforeSave(args[1]) : args[1];
		}
		return this;
	},
	add: function (prop, valuesToAdd) {
		if (typeof valuesToAdd !== "object") return;
		if (!this[prop]) this[prop] = {};
		Object.entries(valuesToAdd).forEach(([k, v]) => {
			this[prop][k] = this._beforeSave ? this._beforeSave(v) : v;
		});

		return this;
	},
	get: function (...args) {
		const [key1, key2] = args;
		if (args.length === 0) return undefined;
		if (args.length === 2) return this[key1]?.[key2];
		return this[key1];
	},
	remove: function (...args) {
		args.length === 2 ? delete this[args[0]][args[1]] : delete this[args[0]];
		return this;
	},
	list: function () {
		return Object.entries(this);
	},
	keys: function () {
		return Object.keys(this);
	},
};

export const installModulePrototype = (base, beforeSave) => {
	if (!base) base = {};
	const proto = Object.create(Object.getPrototypeOf(base));
	const storageFunctions = Array.isArray(base)
		? ArrayStorageFunctions
		: ObjectStorageFunctions;
	if (beforeSave) proto._beforeSave = beforeSave;
	Object.assign(proto, storageFunctions);
	Object.setPrototypeOf(base, proto);
	return base;
};

export const installEventsHandler = (target) => {
	const listeners = new Map();
	const anyListeners = new Set();
	target.listeners = listeners;
	target.hasListeners = (key) => {
		return listeners.has(key);
	};
	target.on = (key, callback) => {
		if (!callback)
			return console.error(
				\`Error adding listener to \${key}: no callback passed\`,
			);
		if (!listeners.has(key)) {
			listeners.set(key, new Set());
		}
		listeners.get(key).add(callback);
	};
	target.off = (key, callback) => {
		const callbackSet = listeners.get(key);
		if (!callbackSet) return;
		callbackSet.delete(callback);
		if (callbackSet.size === 0) {
			listeners.delete(key);
		}
	};
	target.onAny = (callback) => {
		if (!callback)
			return console.error("Error adding onAny listener: no callback passed");
		anyListeners.add(callback.bind(target));
	};
	target.offAny = (callback) => {
		anyListeners.delete(callback);
	};
	target.emit = (key, data) => {
		const results = [];
		listeners.get(key)?.forEach((callback) => {
			try {
				results.push(callback(data));
			} catch (error) {
				console.error(\`Error in listener for key "\${key}":\`, error);
			}
		});
		anyListeners.forEach((callback) => {
			try {
				const bindedFn = callback.bind(target);
				results.push(bindedFn({ key, data }));
			} catch (error) {
				console.error(\`Error in onAny listener for key "\${key}":\`, error);
			}
		});
		return results;
	};
	return target;
};

const eventsBase = { install: installEventsHandler };

export default {
	modules: {
		name: "modules",
		description: "Global modules store",
	},
	storage: {
		name: "storage",
		description: "Storage Module",
		base: {
			install: installModulePrototype,
		},
	},
	error: {
		name: "error",
		base: console.error,
	},
	log: {
		name: "log",
		base: console.log,
	},
	icons: { name: "Icons", base: new Map(Object.entries(self.__icons || {})) },
	theme: {
		name: "theme",
	},
	components: {
		name: "components",
	},
	hooks: {
		name: "hooks",
		description: "Global Hooks store",
		base: {
			get: function (type) {
				return this[type] || [];
			},
			on: function (type, fn) {
				this[type] = Array.isArray(this[type]) ? [...this[type], fn] : [fn];
			},
			set: function (hooks) {
				Object.entries(hooks).forEach(([key, hook]) => this.on(key, hook));
			},
			emit: async function (type, ...args) {
				try {
					if (Array.isArray(this[type])) {
						for (const hook of this[type]) {
							await hook(...args);
						}
					}
				} catch (error) {
					console.error(\`Error running hook '\${type}':\`, error);
				}
			},
			clear: function (type) {
				this[type] = null;
			},
		},
	},
	settings: {
		name: "settings",
		description: "Global settings store",
		base: {
			dev: true,
			backend: false,
			frontend: true,
			mv3: false,
			mv3Injected: false,
			basePath: "",
			...(self.__settings || {}),
		},
		hooks: ({ context }) => ({
			moduleAdded({ module }) {
				if (module.settings) context[module.name] = module.settings;
			},
		}),
	},
	events: {
		name: "events",
		description: "Global events Store",
		base: installEventsHandler(eventsBase),
	},
	data: {
		name: "data",
		description: "Data Migration store",
	},
	routes: {
		name: "routes",
		description: "Routes store",
	},
	devFiles: {
		name: "devFiles",
		base: [],
	},
	assetFiles: {
		name: "assetFiles",
		base: [],
	},
	app: { name: "app" },
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/types/index.js":{content:`const formats = { email: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/ };

const parseJSON = (value) => {
	try {
		return value in specialCases ? value : JSON.parse(value);
	} catch (_) {
		return undefined;
	}
};

const specialCases = {
	undefined: undefined,
	null: null,
	"": null,
	[undefined]: undefined,
};

const typeHandlers = {
	any: (value) => value,
	function: (value) => value,
	extension: () => undefined,
	boolean: (value, { attribute = true } = {}) =>
		(attribute && value === "") || ["true", 1, "1", true].includes(value),
	string: (val) => (val in specialCases ? specialCases[val] : String(val)),
	array: (value, prop = {}) => {
		if (Array.isArray(value)) return value;
		const { itemType } = prop;
		try {
			if (!value) throw value;
			const parsedArray = parseJSON(value);
			if (!Array.isArray(parsedArray)) throw parsedArray;
			return !itemType
				? parsedArray
				: parsedArray.map((item) =>
						typeof item !== "object"
							? item
							: Object.entries(item).reduce((obj, [key, val]) => {
									obj[key] = typeHandlers[itemType[key]?.type]
										? typeHandlers[itemType[key].type](val, prop)
										: val;
									return obj;
								}, {}),
					);
		} catch (_) {
			return [];
		}
	},
	number: (value) => {
		return value ? Number(value) : value;
	},
	date: (value) => new Date(value),
	datetime: (value) => {
		if (!value) return null;
		const date = new Date(value);
		return !Number.isNaN(date.getTime()) ? date : null;
	},
	object: (v, prop = {}) => {
		const value = typeof v === "string" ? parseJSON(v) : v;
		if (prop.properties) {
			Object.entries(prop.properties).map(([propKey, propProps]) => {
				if (propProps.defaultValue !== undefined) {
					value[propKey] = propProps.defaultValue;
				}
			});
		}
		return value;
	},
};

const stringToType = (value, prop = {}) => {
	const { type } = prop;
	return (typeHandlers[type] || ((val) => val))(value, prop);
};

const validations = {
	datetime: (value, prop = {}) => {
		if (prop.min && value < new Date(prop.min)) {
			return ["minimum", null];
		}
		if (prop.max && value > new Date(prop.max)) {
			return ["maximum", null];
		}
	},
	number: (value, prop = {}) => {
		if ("min" in prop && value < prop.min) {
			return ["minimum", null];
		}
		if ("max" in prop && value > prop.max) {
			return ["maximum", null];
		}
		if (Number.isNaN(Number(value))) {
			return ["NaN", null];
		}
	},
};

const validateField = (value, prop) => {
	if (
		prop.required === true &&
		(value === undefined || value === null || value === "")
	)
		return ["required", null];
	const typeHandler = typeHandlers[prop.type];
	if (prop.relationship) {
		if (prop.many) {
			return [
				null,
				Array.isArray(value)
					? value.map((i) => (prop.mixed ? i : (i?.id ?? i)))
					: [],
			];
		}
		return [null, value?.id ?? value];
	}
	const typedValue = typeHandler
		? typeHandler(value, prop)
		: [undefined, null, ""].includes(value)
			? (prop.defaultValue ?? null)
			: value;
	const validation = validations[prop.type];
	if (validation) {
		const errors = validation(value, prop);
		if (errors) return errors;
	}

	if ("format" in prop || formats[prop.key]) {
		const formatFn = "format" in prop ? prop.format : formats[prop.key];
		const format =
			typeof formatFn === "function"
				? prop.format
				: (value) => formatFn.test(value);
		const isValid = format(typedValue);
		if (!isValid) return ["invalid", null];
	}

	return [null, typedValue];
};

function interpolate(str, data) {
	return str.replace(/\\\${(.*?)}/g, (_, key) => {
		return data[key.trim()];
	});
}

const validateType = (
	object,
	{ schema, row = {}, undefinedProps = true, validateVirtual = false },
) => {
	if (!schema) return [null, object];
	const errors = {};
	let hasError = false;

	const props = undefinedProps ? schema : object;
	for (const key in props) {
		const prop = { ...schema[key], key };
		if ("virtual" in prop || prop.persist === false) continue;
		const [error, value] =
			[undefined, null, ""].includes(object[key]) && !prop.required
				? [null, prop.defaultValue]
				: validateField(object[key], prop);
		if (error) {
			hasError = true;
			errors[key] = error;
		} else if (value !== undefined) object[key] = value;
	}
	const virtual = Object.fromEntries(
		Object.entries(schema).filter(([_, prop]) => "virtual" in prop),
	);
	for (const prop in virtual) {
		if (validateVirtual) {
			const [error, value] = validateField(
				interpolate(virtual[prop].virtual, { ...row, ...object }),
				virtual[prop],
			);
			if (error) {
				hasError = true;
				errors[prop] = error;
			} else if (value !== undefined) object[prop] = value;
		} else
			object[prop] = interpolate(virtual[prop].virtual, { ...row, ...object });
	}

	if (hasError) return [errors, null];
	return [null, object];
};

const createType = (type, options) => {
	const normalizedOptions =
		typeof options === "object" && !Array.isArray(options) && options !== null
			? options
			: { defaultValue: options };

	return {
		type,
		persist: true,
		attribute: true,
		...normalizedOptions,
	};
};

const createRelationType =
	(relationship) =>
	(...args) => {
		const targetModel = args[0];
		let targetForeignKey;
		let options = args[2];
		if (typeof args[1] === "string") targetForeignKey = args[1];
		else options = args[1];
		const belongs = belongTypes.includes(relationship);
		return {
			type: belongs
				? relationship === "belongs_many"
					? "array"
					: "string"
				: relationship === "one"
					? "object"
					: "array",
			many: manyTypes.includes(relationship),
			belongs,
			persist: belongs,
			relationship,
			defaultValue: relationship === "belongs_many" ? [] : null,
			polymorphic: targetModel === "*" || Array.isArray(targetModel),
			targetModel,
			targetForeignKey,
			index: belongTypes.includes(relationship),
			...options,
		};
	};

const typesHelpers = {
	createType,
	stringToType,
	validateType,
};

const relationshipTypes = ["one", "many", "belongs", "belongs_many"];
const manyTypes = ["many", "belongs_many"];
const belongTypes = ["belongs", "belongs_many"];
const proxyHandler = {
	get(target, prop) {
		if (target[prop]) return target[prop];
		const type = prop.toLowerCase();
		if (relationshipTypes.includes(prop)) return createRelationType(prop);
		if (type === "extension")
			return (options = {}) =>
				createType("extension", {
					...options,
					persist: false,
					extension: true,
				});
		return (options = {}) => {
			if (!typeHandlers[type]) throw new Error(\`Unknown type: \${type}\`);
			return createType(type, options);
		};
	},
};

const Types = new Proxy(typesHelpers, proxyHandler);

export default Types;
`,mimeType:"application/javascript",skipSW:!1},"/modules/mvc/model/indexeddb/index.js":{content:`export default async () => {
	const parseBoolean = { true: 1, false: 0 };
	const parseBooleanReverse = { true: true, false: false };

	async function open(props) {
		const db = Database(props);
		await db.init();
		return db;
	}

	function Database({ name: dbName, models, version }) {
		let db = null;
		let isConnected = false;
		let connectionPromise = null;
		let dbVersion = Number(version);

		const init = async () => {
			if (connectionPromise) return connectionPromise;

			connectionPromise = new Promise((resolve, reject) => {
				const request = indexedDB.open(dbName, dbVersion);

				request.onerror = (event) => {
					connectionPromise = null;
					reject(new Error(\`Failed to open database: \${event.target.error}\`));
				};

				request.onsuccess = (event) => {
					db = event.target.result;
					isConnected = true;

					db.onversionchange = () => {
						if (db) {
							db.close();
							db = null;
							isConnected = false;
							connectionPromise = null;
						}
					};
					resolve(db);
				};

				request.onupgradeneeded = (event) => {
					const currentDb = event.target.result;
					const transaction = event.target.transaction;
					Object.keys(models).forEach((storeName) => {
						if (!currentDb.objectStoreNames.contains(storeName)) {
							createStore(currentDb, storeName);
						} else {
							const objectStore = transaction.objectStore(storeName);
							const storeSchema = models[storeName];
							Object.keys(storeSchema).forEach((field) => {
								if (
									storeSchema[field].index === true &&
									!objectStore.indexNames.contains(field)
								) {
									objectStore.createIndex(field, field, {
										unique: storeSchema[field].unique || false,
										multiEntry: storeSchema[field].type === "array",
									});
								}
							});
						}
					});
				};
			});

			return connectionPromise;
		};

		const close = () => {
			if (db) {
				db.close();
			}
			db = null;
			isConnected = false;
			connectionPromise = null;
		};

		const reload = async (props) => {
			// Block new connections and wait for any pending one to finish.
			if (connectionPromise) {
				await connectionPromise;
			}

			close();

			// Update the version and models before re-initializing.
			dbVersion = props.version;
			models = props.models;
			// The next call to _ensureDb will trigger a fresh init.

			$APP.Backend.broadcast({
				type: "UPDATE_MODELS",
				payload: { models },
			});
			return init();
		};

		// This is the gatekeeper for all database operations.
		const _ensureDb = async () => {
			if (!isConnected || !db) {
				await init();
			}
		};

		const prepareRow = ({ model, row, reverse = false, currentRow = {} }) => {
			const parse = reverse ? parseBooleanReverse : parseBoolean;
			const modelProps = models[model];
			const updatedRow = { ...row };
			Object.keys(modelProps).forEach((prop) => {
				if (prop.relationship && !prop.belongs) return;
				if (row[prop] === undefined && currentRow[prop] !== undefined) {
					updatedRow[prop] = currentRow[prop];
				} else {
					if (modelProps[prop].type === "boolean") {
						updatedRow[prop] = row[prop] ? parse.true : parse.false;
					}
					if (updatedRow[prop] === undefined) delete updatedRow[prop];
				}
			});
			if (reverse) {
				Object.keys(modelProps).forEach((prop) => {
					if (modelProps[prop].type === "boolean") {
						if (updatedRow[prop] === parseBoolean.true) {
							updatedRow[prop] = true;
						} else if (updatedRow[prop] === parseBoolean.false) {
							updatedRow[prop] = false;
						}
					}
				});
			}
			return updatedRow;
		};

		const matchesFilter = (item, filter, modelName) => {
			const modelSchema = models[modelName];
			return Object.entries(filter).every(([key, queryValue]) => {
				const itemValue = item[key];
				const fieldSchema = modelSchema?.[key];
				if (
					typeof queryValue === "object" &&
					queryValue !== null &&
					!Array.isArray(queryValue)
				) {
					return Object.entries(queryValue).every(([operator, operand]) => {
						switch (operator) {
							case "$gt":
								return itemValue > operand;
							case "$gte":
								return itemValue >= operand;
							case "$lt":
								return itemValue < operand;
							case "$lte":
								return itemValue <= operand;
							case "$ne":
								return itemValue != operand;
							case "$in":
								return Array.isArray(operand) && operand.includes(itemValue);
							case "$nin":
								return Array.isArray(operand) && !operand.includes(itemValue);
							case "$contains":
								if (Array.isArray(itemValue))
									return itemValue.includes(operand);
								if (
									typeof itemValue === "string" &&
									typeof operand === "string"
								)
									return itemValue.includes(operand);
								return false;
							default:
								return false;
						}
					});
				}
				if (fieldSchema?.type === "boolean") {
					return Boolean(itemValue) == queryValue;
				}
				if (fieldSchema?.type === "array" && Array.isArray(itemValue)) {
					return itemValue.includes(queryValue);
				}
				return itemValue === queryValue;
			});
		};

		const createStore = (db, storeName) => {
			const storeSchema = models[storeName];
			const objectStore = db.createObjectStore(storeName, {
				keyPath: "id",
				autoIncrement: true,
			});
			Object.keys(storeSchema).forEach((field) => {
				if (
					storeSchema[field].index === true ||
					storeSchema[field].unique === true
				) {
					objectStore.createIndex(field, field, {
						unique: storeSchema[field].unique ?? false,
						multiEntry: storeSchema[field].type === "array",
					});
				}
			});
		};

		const findIndexedProperty = (filter, modelName) => {
			const modelSchema = models[modelName];
			if (!modelSchema || typeof filter !== "object" || filter === null)
				return null;
			for (const key in filter) {
				if (Object.hasOwn(filter, key)) {
					if (modelSchema[key]?.index) {
						return key;
					}
				}
			}
			return null;
		};

		const put = async (model, row, opts = {}) => {
			await _ensureDb();
			return new Promise((resolve, reject) => {
				const transaction = db.transaction(model, "readwrite");
				const store = transaction.objectStore(model);
				const request = store.put(
					prepareRow({ model, row, currentRow: opts.currentRow }),
				);
				request.onerror = () =>
					reject(new Error(\`Failed to put: \${request.error}\`));
				transaction.oncomplete = () => resolve(request.result);
			});
		};

		const getMany = async (
			storeName,
			filter = {},
			{ limit = 0, offset = 0, order = null, keys } = {},
		) => {
			await _ensureDb();
			return new Promise((resolve, reject) => {
				try {
					const transaction = db.transaction(storeName, "readonly");
					const store = transaction.objectStore(storeName);
					const items = [];
					const modelSchema = models[storeName];
					const finishProcessingAndResolve = () => {
						if (order && items.length > 0) {
							const orderArray = Array.isArray(order)
								? order
								: order.split(",").map((item) => item.trim());
							items.sort((a, b) => {
								for (const currentOrder of orderArray) {
									let direction = 1;
									let field = currentOrder;
									if (currentOrder.startsWith("-")) {
										direction = -1;
										field = currentOrder.substring(1).trim();
									} else if (currentOrder.startsWith("+")) {
										field = currentOrder.substring(1).trim();
									}
									const valA = a[field];
									const valB = b[field];
									if (valA === undefined && valB === undefined) return 0;
									if (valA === undefined) return 1 * direction;
									if (valB === undefined) return -1 * direction;
									if (valA < valB) return -1 * direction;
									if (valA > valB) return 1 * direction;
								}
								return 0;
							});
						}
						const sliced =
							limit > 0
								? items.slice(offset, offset + limit)
								: items.slice(offset);
						resolve(
							sliced.map((row) =>
								prepareRow({ model: storeName, row, reverse: true }),
							),
						);
					};
					if (Array.isArray(filter)) {
						const request = store.openCursor();
						request.onerror = () =>
							reject(
								new Error(\`Failed to getMany \${storeName}: \${request.error}\`),
							);
						request.onsuccess = (event) => {
							const cursor = event.target.result;
							if (cursor) {
								if (
									filter.includes(cursor.key) &&
									(!keys || keys.includes(cursor.key))
								) {
									items.push(cursor.value);
								}
								cursor.continue();
							} else {
								finishProcessingAndResolve();
							}
						};
						return;
					}
					let cursorRequest;
					let useIndex = false;
					const indexedProp = findIndexedProperty(filter, storeName);
					if (indexedProp && Object.keys(filter).length > 0) {
						let queryValue = filter[indexedProp];
						if (modelSchema[indexedProp]?.type === "boolean") {
							queryValue = queryValue ? parseBoolean.true : parseBoolean.false;
						}
						if (queryValue !== undefined) {
							try {
								const index = store.index(indexedProp);
								cursorRequest = index.openCursor(IDBKeyRange.only(queryValue));
								useIndex = true;
							} catch (e) {
								cursorRequest = store.openCursor();
							}
						} else {
							cursorRequest = store.openCursor();
						}
					} else {
						cursorRequest = store.openCursor();
					}
					cursorRequest.onerror = () =>
						reject(
							new Error(
								\`Failed to getMany \${storeName}: \${cursorRequest.error}\`,
							),
						);
					cursorRequest.onsuccess = (event) => {
						const cursor = event.target.result;
						if (cursor) {
							const primaryKeyToCheck = useIndex
								? cursor.primaryKey
								: cursor.key;
							if (keys && !keys.includes(primaryKeyToCheck)) {
								cursor.continue();
								return;
							}
							if (matchesFilter(cursor.value, filter, storeName)) {
								items.push(cursor.value);
							}
							cursor.continue();
						} else {
							finishProcessingAndResolve();
						}
					};
				} catch (error) {
					reject(
						new Error(
							\`Failed to start transaction: \${error.message}. Query Props: \${JSON.stringify({ storeName, limit, offset, filter, order, keys })}\`,
						),
					);
				}
			});
		};

		const get = async (storeName, keyOrFilter) => {
			await _ensureDb();
			return new Promise((resolve, reject) => {
				if (!keyOrFilter) return resolve(null);
				const transaction = db.transaction(storeName, "readonly");
				const store = transaction.objectStore(storeName);
				const modelSchema = models[storeName];
				if (typeof keyOrFilter === "object" && !Array.isArray(keyOrFilter)) {
					const indexedProp = findIndexedProperty(keyOrFilter, storeName);
					let cursorRequest;
					if (indexedProp) {
						let queryValue = keyOrFilter[indexedProp];
						if (modelSchema[indexedProp]?.type === "boolean") {
							queryValue = queryValue ? parseBoolean.true : parseBoolean.false;
						}
						if (queryValue !== undefined) {
							try {
								const index = store.index(indexedProp);
								cursorRequest = index.openCursor(IDBKeyRange.only(queryValue));
							} catch (e) {
								cursorRequest = store.openCursor();
							}
						} else {
							cursorRequest = store.openCursor();
						}
					} else {
						cursorRequest = store.openCursor();
					}
					cursorRequest.onerror = () =>
						reject(new Error(\`Failed to get: \${cursorRequest.error}\`));
					cursorRequest.onsuccess = (event) => {
						const cursor = event.target.result;
						if (cursor) {
							if (matchesFilter(cursor.value, keyOrFilter, storeName)) {
								resolve(
									prepareRow({
										model: storeName,
										row: cursor.value,
										reverse: true,
									}),
								);
							} else {
								cursor.continue();
							}
						} else {
							resolve(null);
						}
					};
				} else {
					if (Array.isArray(keyOrFilter)) {
						reject(
							new Error("Filter for get must be an object or a primary key."),
						);
						return;
					}
					const request = store.get(keyOrFilter);
					request.onerror = () =>
						reject(new Error(\`Failed to get: \${request.error}\`));
					request.onsuccess = () =>
						resolve(
							!request.result
								? null
								: prepareRow({
										model: storeName,
										row: request.result,
										reverse: true,
									}),
						);
				}
			});
		};

		const remove = async (storeName, key) => {
			await _ensureDb();
			return new Promise((resolve, reject) => {
				const transaction = db.transaction(storeName, "readwrite");
				const store = transaction.objectStore(storeName);
				const request = store.delete(key);
				request.onerror = () =>
					reject(new Error(\`Failed to delete: \${request.error}\`));
				request.onsuccess = () => resolve(true);
			});
		};

		const count = async (storeName, { filter = {} } = {}) => {
			await _ensureDb();
			return new Promise((resolve, reject) => {
				const transaction = db.transaction(storeName, "readonly");
				const store = transaction.objectStore(storeName);
				if (Object.keys(filter).length === 0) {
					const request = store.count();
					request.onerror = () =>
						reject(new Error(\`Failed to count: \${request.error}\`));
					request.onsuccess = () => resolve(request.result);
				} else {
					const request = store.openCursor();
					let countNum = 0;
					request.onerror = () =>
						reject(new Error(\`Failed to count: \${request.error}\`));
					request.onsuccess = (event) => {
						const cursor = event.target.result;
						if (cursor) {
							if (matchesFilter(cursor.value, filter, storeName)) {
								countNum++;
							}
							cursor.continue();
						} else {
							resolve(countNum);
						}
					};
				}
			});
		};

		const isEmpty = async (storeName) => {
			const recordCount = await count(storeName);
			return recordCount === 0;
		};

		const clear = async (storeName) => {
			await _ensureDb();
			return new Promise((resolve, reject) => {
				const transaction = db.transaction(storeName, "readwrite");
				const store = transaction.objectStore(storeName);
				const request = store.clear();
				request.onerror = () =>
					reject(new Error(\`Failed to clear: \${request.error}\`));
				request.onsuccess = () => resolve();
			});
		};

		const destroy = async () => {
			const dbNameToDelete = dbName;
			close();
			return new Promise((resolve, reject) => {
				const request = indexedDB.deleteDatabase(dbNameToDelete);
				request.onerror = () =>
					reject(new Error(\`Failed to delete database: \${request.error}\`));
				request.onsuccess = () => resolve();
			});
		};

		const exportStore = async (storeName) => {
			await _ensureDb();
			return new Promise((resolve, reject) => {
				const transaction = db.transaction(storeName, "readonly");
				const store = transaction.objectStore(storeName);
				const request = store.getAll();
				request.onerror = () =>
					reject(new Error(\`Failed to export: \${request.error}\`));
				request.onsuccess = () => {
					const dump = {};
					if (request.result) {
						request.result.forEach((item) => {
							if (["string", "number"].includes(typeof item.id)) {
								dump[item.id] = item;
							}
						});
					}
					resolve(dump);
				};
			});
		};

		const importStore = async (storeName, data) => {
			await _ensureDb();
			if (!Array.isArray(data)) {
				throw new Error("No data provided or data is not an array");
			}
			if (data.length === 0) return Promise.resolve();
			return new Promise((resolve, reject) => {
				const transaction = db.transaction(storeName, "readwrite");
				const store = transaction.objectStore(storeName);
				let completed = 0;
				let firstError = null;
				data.forEach((entry) => {
					if (firstError) return;
					const request = store.put(entry);
					request.onerror = () => {
						if (!firstError) {
							firstError = request.error;
							transaction.abort();
							reject(new Error(\`Failed to import: \${firstError}\`));
						}
					};
					request.onsuccess = () => {
						if (firstError) return;
						completed++;
						if (completed === data.length) {
						}
					};
				});
				transaction.oncomplete = () => {
					if (!firstError) resolve();
				};
				transaction.onerror = () => {
					if (!firstError)
						reject(
							new Error(
								\`Transaction error during import: \${transaction.error}\`,
							),
						);
				};
			});
		};

		const transactionWrapper = async (storeNames, mode = "readwrite") => {
			await _ensureDb();
			const idbTransaction = db.transaction(storeNames, mode);
			return {
				transaction: idbTransaction,
				put: (model, row, opts = {}) => {
					return new Promise((resolve, reject) => {
						const store = idbTransaction.objectStore(model);
						const preparedRow = prepareRow({
							model,
							row,
							currentRow: opts.currentRow,
						});
						const request = store.put(preparedRow);
						request.onsuccess = () => resolve(request.result);
						request.onerror = () => reject(request.error);
					});
				},
				remove: (model, id) => {
					return new Promise((resolve, reject) => {
						const store = idbTransaction.objectStore(model);
						const request = store.delete(id);
						request.onsuccess = () => resolve(true);
						request.onerror = () => reject(request.error);
					});
				},
				done: () => {
					return new Promise((resolve, reject) => {
						idbTransaction.oncomplete = () => resolve();
						idbTransaction.onerror = () => reject(idbTransaction.error);
						idbTransaction.onabort = () =>
							reject(idbTransaction.error || new Error("Transaction aborted"));
					});
				},
				abort: () => idbTransaction.abort(),
			};
		};

		return {
			init,
			transaction: transactionWrapper,
			getMany,
			prepareRow,
			put,
			get,
			remove,
			reload,
			count,
			isEmpty,
			clear,
			get db() {
				return db;
			},
			close,
			destroy,
			export: exportStore,
			import: importStore,
			get isConnected() {
				return isConnected;
			},
			get version() {
				return dbVersion;
			},
			name: dbName,
			models,
		};
	}

	return { open };
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/mvc/model/database/index.js":{content:`export const dependencies = {
	metadata: "/modules/mvc/model/extensions/metadata.js",
	operations: "/modules/mvc/model/extensions/operations.js",
};
export default async ({ $APP, T, IndexedDBWrapper, metadata, operations }) => {
	const addModels = ({ context, collection = "models" }) => {
		return ({ module }) => {
			if (!module[collection]) return;
			const models = Object.fromEntries(
				Object.keys(module[collection]).map((model) => {
					const props = {
						id: T.string({ primary: true }),
						...module[collection][model],
					};
					return [
						model,
						Object.fromEntries(
							Object.entries(props).map(([key, prop]) => {
								prop.name = key;
								if (prop.relationship && !prop.targetForeignKey)
									prop.targetForeignKey = model;
								return [key, prop];
							}),
						),
					];
				}),
			);
			context.set(models);
		};
	};

	const availableDatabaseExtensions = {
		operations,
		metadata,
	};

	$APP.addModule({
		name: "sysmodels",
		hooks: ({ context }) => ({
			moduleAdded: addModels({ context, collection: "sysmodels" }),
		}),
		settings: { APP: "App", USER: "User", DEVICE: "Device" },
	});

	$APP.sysmodels.set({
		[$APP.settings.sysmodels.APP]: {
			name: T.string({ index: true, primary: true }),
			version: T.number(),
			users: T.many($APP.settings.sysmodels.USER, "appId"),
			active: T.boolean({ defaultValue: true, index: true }),
			models: T.object(),
			migrationTimestamp: T.number(),
		},
		[$APP.settings.sysmodels.USER]: {
			name: T.string({ index: true, primary: true }),
			appId: T.one($APP.settings.sysmodels.APP, "users"),
			devices: T.many($APP.settings.sysmodels.DEVICE, "userId"),
			publicKey: T.string(),
			privateKey: T.string(),
			active: T.boolean({ index: true }),
		},
		[$APP.settings.sysmodels.DEVICE]: {
			name: T.string({ index: true, primary: true }),
			userId: T.one($APP.settings.sysmodels.USER, "devices"),
			deviceData: T.string(),
			active: T.number({ defaultValue: true, index: true }),
		},
	});

	const isSystem = (model) => !!$APP.sysmodels[model];

	$APP.addModule({
		name: "DatabaseExtensions",
		base: $APP.storage.install([]),
	});

	const filterExtensionModels = (models, ext) =>
		Object.fromEntries(
			Object.entries(models)
				.filter(([_, schema]) => Object.hasOwn(schema, \`$\${ext}\`))
				.map(([model]) => [model, availableDatabaseExtensions[ext]]),
		);

	const loadDBDump = async (payload) => {
		const { dump } = payload;
		const app = payload.app ?? (await $APP.Backend.getApp());
		if (!dump) throw "No dump provided";
		if (!app) throw "No app selected";
		for (const [modelName, entries] of Object.entries(dump))
			if ($APP.Model[modelName])
				await $APP.Model[modelName].addMany(entries, { keepIndex: true });

		await $APP.SysModel.edit($APP.settings.sysmodels.APP, {
			id: app.id,
			migrationTimestamp: Date.now(),
		});
	};

	const createDBDump = async () => {
		const app = await $APP.Backend.getApp();
		const dump = {};
		const modelNames = Object.keys(app.models);

		for (const modelName of modelNames)
			if ($APP.Model[modelName])
				dump[modelName] = await $APP.Model[modelName].getAll({ object: true });

		return dump;
	};

	const createDatabase = () => {
		let models;
		let version;
		let name;
		let db;
		let system;
		const extdbs = {};
		const stores = {};

		const open = async (props = {}) => {
			if (props.extensions) $APP.DatabaseExtensions.add(...props.extensions);
			if (props.name) name = props.name;
			if (props.models) models = props.models;
			if (props.version) version = props.version;
			system = props.system === true;
			if (db) db.close();
			db = await IndexedDBWrapper.open({
				name,
				version,
				models,
			});
			if ($APP.DatabaseExtensions.length && !system) {
				$APP.DatabaseExtensions.forEach(async (ext) => {
					extdbs[ext] = await IndexedDBWrapper.open({
						name: \`\${name}_\${ext}\`,
						version,
						models: filterExtensionModels(models, ext),
					});
				});
			}
		};

		const _loadRelationshipsForMany = async (
			rows,
			modelName,
			includes,
			opts,
		) => {
			if (!rows || rows.length === 0 || !includes || includes.length === 0)
				return;
			const modelDef = models[modelName];
			const idsToFetchByModel = {};
			const relationshipDetails = {};

			for (const relation of includes) {
				const relationDef = modelDef[relation];
				if (!relationDef) continue;
				relationshipDetails[relation] = relationDef;

				const { targetModel, belongs, polymorphic, mixed } = relationDef;

				for (const row of rows) {
					let fkValue = row[relation];

					if (belongs) {
						fkValue = row[relation];
					} else {
						continue;
					}
					if (fkValue === null || fkValue === undefined) continue;

					const addId = (model, id) => {
						if (!idsToFetchByModel[model]) idsToFetchByModel[model] = new Set();
						idsToFetchByModel[model].add(id);
					};

					const processFkValue = (val) => {
						if (polymorphic) {
							if (typeof val === "string") {
								const [polyModel, polyId] = val.split("@");
								if (polyModel && polyId) addId(polyModel, polyId);
							}
						} else if (typeof val === "string") {
							addId(targetModel, val);
						} else if (mixed && typeof val === "object" && val !== null) {
						}
					};
					if (Array.isArray(fkValue)) {
						fkValue.forEach(processFkValue);
					} else {
						processFkValue(fkValue);
					}
				}
			}

			const fetchedItemsByModel = {};
			for (const [modelToFetch, idSet] of Object.entries(idsToFetchByModel)) {
				if (idSet.size > 0) {
					const ids = Array.from(idSet);
					const items = await api.getMany(modelToFetch, ids);
					fetchedItemsByModel[modelToFetch] = items.reduce((acc, item) => {
						acc[item.id] = item;
						return acc;
					}, {});
				}
			}

			for (const row of rows) {
				for (const relation of includes) {
					const relationDef = relationshipDetails[relation];
					if (!relationDef) continue;

					const { targetModel, belongs, polymorphic, mixed, many } =
						relationDef;
					const transform = opts.transform ?? relationDef.transform;

					if (belongs) {
						const fkValueOnCurrentRow = row[relation];
						if (
							fkValueOnCurrentRow === null ||
							fkValueOnCurrentRow === undefined
						) {
							row[relation] = many ? [] : null;
							continue;
						}

						const stitch = (fk) => {
							let model = targetModel;
							let id = fk;
							if (polymorphic && typeof fk === "string") {
								[model, id] = fk.split("@");
							}
							if (mixed && typeof fk === "object" && fk !== null) return fk;

							const item = fetchedItemsByModel[model]?.[id] ?? null;
							return transform ? transform(item, model) : item;
						};

						if (many) {
							row[relation] = Array.isArray(fkValueOnCurrentRow)
								? fkValueOnCurrentRow.map(stitch).filter(Boolean)
								: [];
						} else {
							row[relation] = stitch(fkValueOnCurrentRow);
						}
					} else {
						let filter;
						if (polymorphic) {
							const searchPolymorphicId = \`\${modelName}@\${row.id}\`;
							const targetFkDef =
								models[targetModel]?.[relationDef.targetForeignKey];
							if (targetFkDef?.many) {
								filter = {
									[relationDef.targetForeignKey]: {
										$contains: searchPolymorphicId,
									},
								};
							} else {
								filter = {
									[relationDef.targetForeignKey]: searchPolymorphicId,
								};
							}
						} else {
							filter = { [relationDef.targetForeignKey]: row.id };
						}
						row[relation] =
							relationDef.relationship === "one"
								? await api.get(targetModel, filter)
								: await api.getMany(targetModel, filter);
					}
				}
			}
		};

		const api = {
			loadDBDump,
			createDBDump,
			extdbs,
			get db() {
				return db;
			},
			get models() {
				return models;
			},
			get version() {
				return db?.version;
			},
			open,
			stores,
			reload: open,
			count: (...args) => db.count(...args),
			isEmpty: (...args) => db.isEmpty(...args),
			async put(model, row = {}, opts = {}) {
				const { skipRelationship = false, currentRow = {} } = opts;
				const properties = models[model];
				if (!properties)
					return console.error(
						\`Model \${model} not found. current schema version: \${version} / \${db.version}\`,
					);
				if (isSystem(model)) {
					try {
						const result = await db.put(model, row);
						if (result) {
							const row = await db.get(model, result);
							return [null, row];
						}
						return [null, null];
					} catch (error) {
						return [error, null];
					}
				}
				const [errors, validatedRow] = T.validateType(row, {
					schema: models[model],
					row: currentRow,
					undefinedProps: !!opts.insert,
					validateVirtual: true,
				});
				if (errors) return [errors, null];
				try {
					if (skipRelationship) {
						await db.put(model, validatedRow, opts);
						return [null, validatedRow];
					}
					const storesToTransact = [model];
					const relationships = Object.keys(properties).filter((prop) => {
						const propDef = properties[prop];
						const bool =
							propDef.targetModel &&
							propDef.relationship &&
							validatedRow[prop] !== undefined &&
							validatedRow[prop] !== null;
						if (bool && !storesToTransact.includes(propDef.targetModel)) {
							if (propDef.polymorphic) {
							} else storesToTransact.push(propDef.targetModel);
						}
						return bool;
					});
					const id = validatedRow.id || row.id;
					const updates = [];
					for (const propKey of relationships) {
						const prop = properties[propKey];
						let relatedValue = validatedRow[propKey];
						if (prop.many && Array.isArray(relatedValue)) {
							const newFkArray = [];
							for (const item of relatedValue) {
								if (
									typeof item === "string" ||
									(prop.mixed && typeof item === "object" && item !== null)
								) {
									newFkArray.push(item);
								} else {
									const childModel = prop.targetModel;
									if (models[childModel]) {
										const newChildRow = { ...item };
										if (!newChildRow.id)
											newChildRow.id = $APP.Backend.generateId();

										updates.push([childModel, newChildRow]);
										if (!storesToTransact.includes(childModel))
											storesToTransact.push(childModel);

										const idToStore = prop.polymorphic
											? \`\${childModel}@\${newChildRow.id}\`
											: newChildRow.id;
										newFkArray.push(idToStore);
									}
								}
							}
							validatedRow[propKey] = newFkArray;
							relatedValue = newFkArray;
						}

						if (!models[prop.targetModel] && !prop?.polymorphic) {
							console.error(
								\`ERROR: couldn't find target model '\${prop.targetModel}' for relationship '\${propKey}' on model '\${model}'\`,
							);
							continue;
						}
						const fkProp = models[prop.targetModel]?.[prop.targetForeignKey];
						if (!fkProp) {
							if (!prop.belongs) {
								console.warn(
									\`WARN: couldn't find target foreign key '\${prop.targetForeignKey}' in model '\${prop.targetModel}' for relationship '\${propKey}' from '\${model}'. This might be a one-way definition or configuration issue.\`,
								);
							}
							continue;
						}
						if (fkProp.belongs) {
							const effectiveFkId = fkProp.polymorphic ? \`\${model}@\${id}\` : id;
							const targetIsMany = fkProp.many;

							if (targetIsMany) {
								const fks = Array.isArray(relatedValue)
									? relatedValue
									: [relatedValue];
								if (fks.length) {
									const targets = await api.getMany(
										prop.targetModel,
										fks.map((fk) =>
											fk && typeof fk === "object" ? fk.id : fk,
										),
									);
									targets.forEach((target) => {
										if (target) {
											const fk = target[prop.targetForeignKey];
											if (!fk) target[prop.targetForeignKey] = [effectiveFkId];
											else if (!fk.includes(effectiveFkId))
												fk.push(effectiveFkId);
											updates.push([prop.targetModel, target]);
										}
									});
								}
							} else {
								const targetId =
									typeof relatedValue === "string"
										? relatedValue
										: relatedValue?.id;
								if (targetId) {
									const target = await api.get(prop.targetModel, targetId);
									if (target) {
										target[prop.targetForeignKey] = effectiveFkId;
										updates.push([prop.targetModel, target]);
									}
								}
							}
						}
						if (!prop.belongs && !properties[propKey]?.polymorphic) {
							delete validatedRow[propKey];
						}
					}

					updates.push([model, validatedRow]);
					const tx = await db.transaction(storesToTransact);
					const relatedPuts = updates.map(([m, r]) => tx.put(m, r));
					await Promise.all(relatedPuts);
					await tx.done();
					return [null, validatedRow];
				} catch (error) {
					console.error("Error in put operation:", error, {
						model,
						row,
						models,
						version,
					});
					return [error, null];
				}
			},
			async get(model, filter, opts = {}) {
				if (!filter) return null;
				const { insert = false, includes = [], recursive = null } = opts;
				let row = await db.get(model, filter);
				if (!row && !insert) return null;
				if (!row && insert) {
					const [error, newRow] = await api.add(
						model,
						typeof filter === "object" ? filter : { id: filter },
						{
							skipRelationship: true,
							...(typeof filter !== "object" && {
								overrideId: true,
								keepIndex: true,
							}),
						},
					);
					if (error) {
						console.error("Failed to insert record in get():", error);
						return null;
					}
					row = newRow;
				}
				if (row && includes.length) {
					await _loadRelationshipsForMany([row], model, includes, opts);
				}
				if (row && recursive) {
					const visited = new Set();
					let itemsToProcess = [row];
					const relationName = recursive;
					while (itemsToProcess.length > 0) {
						const currentBatch = [];
						for (const item of itemsToProcess) {
							const modelForVisitor = item._modelName || model;
							const visitedKey = \`\${modelForVisitor}@\${item.id}\`;
							if (!visited.has(visitedKey)) {
								visited.add(visitedKey);
								currentBatch.push(item);
							}
						}

						if (currentBatch.length === 0) break;

						await _loadRelationshipsForMany(
							currentBatch,
							model,
							[relationName],
							opts,
						);

						itemsToProcess = [];
						for (const item of currentBatch) {
							const children = item[relationName];
							if (Array.isArray(children)) {
								children.forEach((child) => {
									if (child) {
										const relDef = models[model][relationName];
										if (relDef) child._modelName = relDef.targetModel;
										itemsToProcess.push(child);
									}
								});
							} else if (children) {
								const relDef = models[model][relationName];
								if (relDef) children._modelName = relDef.targetModel;
								itemsToProcess.push(children);
							}
						}
					}
				}
				return row;
			},
			async getMany(model, filter, opts = {}) {
				const { limit, offset, order, includes = [], recursive = null } = opts;
				let items;
				if (Array.isArray(filter)) {
					items = (
						await Promise.all(filter.map((id) => db.get(model, id)))
					).filter((item) => item !== null);
				} else {
					items = await db.getMany(model, filter, {
						limit,
						offset,
						order,
					});
				}

				if (includes.length && items.length)
					await _loadRelationshipsForMany(items, model, includes, opts);

				if (recursive && items.length) {
					const visited = new Set();
					let itemsToProcess = [...items];
					const relationName = recursive;

					while (itemsToProcess.length > 0) {
						const currentBatch = [];
						for (const item of itemsToProcess) {
							const modelForVisitor = item._modelName || model;
							const visitedKey = \`\${modelForVisitor}@\${item.id}\`;
							if (!visited.has(visitedKey)) {
								visited.add(visitedKey);
								currentBatch.push(item);
							}
						}

						if (currentBatch.length === 0) break;

						const batchModelName = currentBatch[0]._modelName || model;
						await _loadRelationshipsForMany(
							currentBatch,
							batchModelName,
							[relationName],
							opts,
						);

						itemsToProcess = [];
						for (const item of currentBatch) {
							const children = item[relationName];
							const relDef = models[batchModelName][relationName];
							if (Array.isArray(children)) {
								children.forEach((child) => {
									if (child) {
										if (relDef) child._modelName = relDef.targetModel;
										itemsToProcess.push(child);
									}
								});
							} else if (children) {
								if (relDef) children._modelName = relDef.targetModel;
								itemsToProcess.push(children);
							}
						}
					}
				}

				if (!limit) return items;

				const count = await db.count(
					model,
					Array.isArray(filter) ? { id: { $in: filter } } : filter,
				);
				return { count, limit, offset, items };
			},
			async remove(model, id, opts = {}) {
				const properties = models[model];
				if (!properties) {
					console.error(\`Model \${model} not found for removal.\`);
					return false;
				}
				const row = await api.get(model, id);
				if (!row) return false;
				const relationships = Object.keys(properties).filter(
					(prop) =>
						properties[prop].targetModel && properties[prop].relationship,
				);
				const storesToTransact = [model];
				const updates = [];

				if (relationships.length > 0) {
					for (const propKey of relationships) {
						const propDef = properties[propKey];
						if (!propDef.targetModel || !propDef.targetForeignKey) continue;

						if (!storesToTransact.includes(propDef.targetModel)) {
							if (propDef.polymorphic) {
							} else storesToTransact.push(propDef.targetModel);
						}

						const targetModelName = propDef.targetModel;
						const fkFieldNameOnTarget = propDef.targetForeignKey;
						const fkFieldDefOnTarget =
							models[targetModelName]?.[fkFieldNameOnTarget];

						if (!fkFieldDefOnTarget) continue;

						if (fkFieldDefOnTarget.belongs) {
							const valueToRemove = fkFieldDefOnTarget.polymorphic
								? \`\${model}@\${id}\`
								: id;
							let filterForTargets;

							if (fkFieldDefOnTarget.many) {
								filterForTargets = {
									[fkFieldNameOnTarget]: { $contains: valueToRemove },
								};
							} else
								filterForTargets = { [fkFieldNameOnTarget]: valueToRemove };

							const targetsToUpdate = await api.getMany(
								targetModelName,
								filterForTargets,
							);

							targetsToUpdate.forEach((target) => {
								let newFkValue;
								if (fkFieldDefOnTarget.many) {
									newFkValue = (target[fkFieldNameOnTarget] || []).filter(
										(entry) => entry !== valueToRemove,
									);
								} else {
									newFkValue = null;
								}
								updates.push([
									targetModelName,
									{ ...target, [fkFieldNameOnTarget]: newFkValue },
								]);
							});
						}
					}
				}
				try {
					const tx = await db.transaction(storesToTransact);
					const relatedPuts = updates.map(([targetModel, targetRow]) =>
						tx.put(targetModel, targetRow),
					);
					const mainRemove = tx.remove(model, id);
					await Promise.all([...relatedPuts, mainRemove]);
					await tx.done();
					const system = isSystem(model);
					[\`ModelRemoveRecord-\${model}\`, "onRemoveRecord"].forEach((event) =>
						$APP.hooks.emit(event, {
							model,
							opts,
							id,
							system,
							row,
							db: api,
							extensions: Object.keys(models[model])
								.filter((prop) => prop[0] === "$")
								.map((prop) => prop.slice(1)),
						}),
					);
					return true;
				} catch (error) {
					console.error(
						"Failed to remove record or update relationships:",
						error,
						{ model, id },
					);
					return false;
				}
			},
			async removeMany(model, filter, opts = {}) {
				if (!filter && opts.filter) filter = opts.filter;
				const entries = Array.isArray(filter)
					? filter.map((item) => (typeof item === "object" ? item.id : item))
					: (await db.getMany(model, filter)).map((entry) => entry.id);
				return Promise.all(
					entries
						.filter(Boolean)
						.map((entryId) => api.remove(model, entryId, opts)),
				);
			},
			async edit(model, row, _opts = {}) {
				if (!row || !row.id) {
					console.error("Edit operation requires a row with an ID.", {
						model,
						row,
					});
					return {
						errors: { id: "ID is required for edit." },
						model,
						row,
						opts: _opts,
					};
				}
				const opts = {
					..._opts,
					update: true,
					currentRow:
						_opts.currentRow ??
						(await api.get(model, row.id, { includes: [] })),
				};
				if (!opts.currentRow) {
					console.warn(\`Record not found for edit: \${model} with id \${row.id}\`);
					return { errors: { record: "Record not found." }, model, row, opts };
				}
				const [errors, patchResult] = await api.put(
					model,
					{ ...opts.currentRow, ...row },
					opts,
				);

				if (errors) return { errors, model, row, opts };
				const system = isSystem(model);
				[\`ModelEditRecord-\${model}\`, "onEditRecord"].forEach((event) =>
					$APP.hooks.emit(event, {
						row,
						model,
						system,
						opts,
						db: api,
						extensions: Object.keys(models[model])
							.filter((prop) => prop[0] === "$")
							.map((prop) => prop.slice(1)),
					}),
				);
				return patchResult;
			},
			async editMany(model, rows, opts = {}) {
				if (!rows?.length) return [];
				const results = await Promise.allSettled(
					rows.map(async (row) => {
						if (row?.id) return api.edit(model, row, opts);
						return { errors: { id: "Row or ID missing for editMany" }, row };
					}),
				);
				return results;
			},
			async editAll(model, filter, updates, opts = {}) {
				const rows = await db.getMany(model, filter, {
					...opts,
				});
				const results = await Promise.allSettled(
					rows.map((row) =>
						api.edit(
							model,
							{ ...row, ...updates },
							{ ...opts, currentRow: row },
						),
					),
				);
				return results;
			},
			async add(model, row, opts = {}) {
				const newRow = { ...row };
				const system = isSystem(model);
				if ((!system && !opts.keepIndex && !opts.overrideId) || !newRow.id) {
					newRow.id = $APP.Backend.generateId();
				}
				const [errors, resultRow] = await api.put(model, newRow, {
					...opts,
					insert: true,
				});
				if (errors) return { errors, model, row: newRow, opts };
				[\`ModelAddRecord-\${model}\`, "onAddRecord"].forEach((event) =>
					$APP.hooks.emit(event, {
						model,
						row: resultRow,
						system,
						opts,
						db: api,
						extensions: Object.keys(models[model])
							.filter((prop) => prop[0] === "$")
							.map((prop) => prop.slice(1)),
					}),
				);

				return resultRow;
			},
			async addMany(model, rows = [], opts = {}) {
				const results = await Promise.allSettled(
					rows.map((row) => api.add(model, row, opts)),
				);
				return results;
			},
		};
		return api;
	};

	const SysModel = createDatabase();
	await SysModel.open({
		name: $APP.settings.sysmodels.APP,
		version: 1,
		models: $APP.sysmodels,
		system: true,
	});

	$APP.addModule({
		name: "sysmodel",
		alias: "SysModel",
		base: SysModel,
	});

	const Database = createDatabase();

	$APP.hooks.on(
		"APP:BACKEND_STARTED",
		async ({ app, user, device, models }) => {
			if (!app || !models) {
				console.error(
					"APP:BACKEND_STARTED hook called with invalid app or models.",
					{
						app,
						models,
					},
				);
				return;
			}

			await Database.open({
				name: app.id,
				version: app.version,
				extensions: app.extensions,
				system: false,
				models: { ...models, ...(app.models || {}) },
			});
			$APP.hooks.emit("APP:DATABASE_STARTED", { app, user, device });
		},
	);

	return Database;
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/mvc/model/extensions/metadata.js":{content:`export const module = true;
export default ({ T, $APP }) => {
	$APP.hooks.set({
		onAddRecord({ model, row, system, extensions }) {
			if (system || !$APP.Database.extdbs || !extensions.includes("metadata"))
				return;
			const db = $APP.Database.extdbs.metadata;
			if (!db) return console.error("Metadata database instance not active.");
			db.put(model, {
				id: row.id,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});
		},
		async onEditRecord({ model, row, system, extensions }) {
			if (system || !$APP.Database.extdbs || !extensions.includes("metadata"))
				return;
			const db = $APP.Database.extdbs.metadata;
			if (!db) return console.error("Metadata database instance not active.");
			const metadataRow = await db.get(model, row.id);
			metadataRow.updatedAt = Date.now();
			db.put(model, metadataRow);
		},
		onRemoveRecord({ model, id, system, extensions }) {
			if (system || !$APP.Database.extdbs || !extensions.includes("metadata"))
				return;
			const db = $APP.Database.extdbs.metadata;
			if (!db) return console.error("Metadata database instance not active.");
			db.remove(model, id);
		},
	});
	return {
		createdAt: T.string({ index: true }),
		updatedAt: T.string({ index: true }),
		createdBy: T.string({ index: true }),
		updatedBy: T.string({ index: true }),
	};
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/mvc/model/extensions/operations.js":{content:`export const module = true;
export default ({ T, $APP }) => {
	$APP.hooks.set({
		onAddRecord({ model, row, system, extensions }) {
			if (system || !$APP.Database.extdbs || !extensions.includes("operations"))
				return;
			const db = $APP.Database.extdbs.operations;
			if (!db) return console.error("Operations database instance not active.");
			db.put(model, {
				timestamp: Date.now(),
				row,
			});
		},
		async onEditRecord({ model, id, row, system, extensions }) {
			if (system || !$APP.Database.extdbs || !extensions.includes("operations"))
				return;
			const db = $APP.Database.extdbs.operations;
			if (!db) return console.error("Operations database instance not active.");
			db.put(model, {
				timestamp: Date.now(),
				rowId: id,
				row,
			});
		},
		onRemoveRecord({ model, id, system, extensions }) {
			if (system || !$APP.Database.extdbs || !extensions.includes("operations"))
				return;
			const db = $APP.Database.extdbs.operations;
			if (!db) return console.error("Operations database instance not active.");
			db.put(model, {
				timestamp: Date.now(),
				removedAt: Date.now(),
				rowId: id,
			});
		},
	});
	return {
		createdAt: T.string({ index: true }),
		removedAt: T.string(),
		rowId: T.string({ index: true }),
		row: T.object(),
	};
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/mvc/model/backend.js":{content:`import Model from "/modules/mvc/model/index.js";

export default ({ $APP, Database }) => {
	const queryModelEvents = {
		DISCONNECT: (_, { port }) => port.removePort(),
		CREATE_REMOTE_WORKSPACE: async ({ payload }, { importDB }) =>
			importDB(payload),
		ADD_REMOTE_USER: async ({ payload }) =>
			$APP.Backend.createUserEntry(payload),
		ADD: async ({ payload, respond }) => {
			const response = await Database.add(
				payload.model,
				payload.row,
				payload.opts,
			);
			respond(response);
		},
		ADD_MANY: async ({ payload, respond }) => {
			const response = await Database.addMany(
				payload.model,
				payload.rows,
				payload.opts,
			);
			respond({ success: true, results: response });
		},
		REMOVE: async ({ payload, respond }) => {
			const response = await Database.remove(
				payload.model,
				payload.id,
				payload.opts,
			);
			respond(response);
		},
		REMOVE_MANY: async ({ payload, respond }) => {
			const response = await Database.removeMany(
				payload.model,
				payload.ids,
				payload.opts,
			);
			respond({ success: true, results: response });
		},
		EDIT: async ({ payload, respond }) => {
			const response = await Database.edit(
				payload.model,
				payload.row,
				payload.opts,
			);
			respond(response);
		},
		EDIT_MANY: async ({ payload, respond }) => {
			const response = await Database.editMany(
				payload.model,
				payload.rows,
				payload.opts,
			);
			respond({ success: true, results: response });
		},
		GET: async ({ payload, respond }) => {
			const { id, model, opts = {} } = payload;
			const response = await Database.get(
				model,
				id ??
					(opts.filter &&
						((typeof opts.filter === "string" && JSON.parse(opts.filter)) ||
							opts.filter)),
				opts,
			);
			respond(response);
		},
		GET_MANY: async ({ payload: { model, opts = {} }, respond } = {}) => {
			const response = await Database.getMany(model, opts.filter, opts);
			respond(response);
		},
	};

	$APP.events.set(queryModelEvents);

	const request = (action, modelName, payload = {}) => {
		return new Promise((resolve) => {
			const event = queryModelEvents[action];
			if (event && typeof event === "function") {
				event({
					respond: resolve,
					payload: {
						model: modelName,
						...payload,
					},
				});
			} else
				resolve({ success: false, error: \`Action "\${action}" not found.\` });
		});
	};

	const syncRelationships = ({ model, row }) => {
		if (!row) return;

		const props = $APP.models[model];
		const relationships = Object.entries(props).filter(
			([, prop]) => prop.belongs && prop.targetModel !== "*",
		);

		if (!relationships.length) return;

		relationships.forEach(([key, prop]) => {
			if (row[key]) {
				$APP.Backend.broadcast({
					type: "REQUEST_DATA_SYNC",
					payload: {
						key: \`get:\${row[key]}\`,
						model: prop.targetModel,
						data: undefined,
					},
				});
			}
		});
	};

	const handleExtensions = ({ row, db, model }) => {
		if (!row.models) return;
		const currentExtensions = new Set(row.extensions || []);
		const foundExtensions = new Set();
		Object.values(row.models).forEach((modelSchema) =>
			Object.keys(modelSchema).forEach((prop) => {
				if (prop.startsWith("$")) {
					foundExtensions.add(prop.slice(1));
				}
			}),
		);
		const newExtensions = [...foundExtensions].filter(
			(ext) => !currentExtensions.has(ext),
		);

		if (newExtensions.length === 0) return;

		console.log(\`New extensions found: \${newExtensions.join(", ")}\`);

		newExtensions.forEach((extensionName) => {
			console.log(\`Initializing extension: \${extensionName}\`);
			$APP.DatabaseExtensions.add(extensionName);
		});

		const allExtensions = [...currentExtensions, ...newExtensions];
		db.edit(model, { ...row, extensions: allExtensions });
	};

	$APP.hooks.set({
		"ModelAddRecord-App": handleExtensions,
		"ModelEditRecord-App": handleExtensions,
		onAddRecord({ model, row, system }) {
			if (system) return;
			$APP.Backend.broadcast({
				type: "REQUEST_DATA_SYNC",
				payload: { key: \`get:\${row.id}\`, model, data: row },
			});
			syncRelationships({ model, row });
			console.log("BROADCAST MESSAGE", {
				system,
				type: "REQUEST_DATA_SYNC",
				payload: { key: \`get:\${row.id}\`, model, data: row },
			});
		},
		onEditRecord({ model, row, system }) {
			if (system) return;
			$APP.Backend.broadcast({
				type: "REQUEST_DATA_SYNC",
				payload: { key: \`get:\${row.id}\`, model, data: row },
			});
			syncRelationships({ model, row });
		},
		onRemoveRecord({ model, row, id, system }) {
			if (system) return;
			$APP.Backend.broadcast({
				type: "REQUEST_DATA_SYNC",
				payload: { key: \`get:\${id}\`, model, data: undefined },
			});
			syncRelationships({ model, row });
		},
	});

	Model.request = request;
	return Model;
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/mvc/model/index.js":{content:`import $APP from "/bootstrap.js";
import T from "/modules/types/index.js";

const addModels = ({ context, collection = "models" }) => {
	return ({ module }) => {
		if (!module[collection]) return;
		const models = Object.fromEntries(
			Object.keys(module[collection]).map((model) => {
				const props = {
					id: T.string({ primary: true }),
					...module[collection][model],
				};
				return [
					model,
					Object.fromEntries(
						Object.entries(props).map(([key, prop]) => {
							prop.name = key;
							if (prop.relationship && !prop.targetForeignKey)
								prop.targetForeignKey = model;
							return [key, prop];
						}),
					),
				];
			}),
		);
		context.set(models);
	};
};

$APP.addModule({
	name: "models",
	hooks: ({ context }) => ({
		moduleAdded: addModels({ context, collection: "models" }),
		moduleUpdated: addModels({ context, collection: "models" }),
	}),
});

const instanceProxyHandler = {
	get(target, prop, receiver) {
		if (prop === "remove") {
			return () =>
				Model.request("REMOVE", target._modelName, { id: target.id });
		}

		if (prop === "update") {
			return () => {
				const cleanRow = { ...target };
				delete cleanRow._modelName;
				return Model.request("EDIT", target._modelName, {
					row: cleanRow,
				});
			};
		}

		if (prop === "include") {
			return async (include) => {
				if (!target.id || !target._modelName) {
					console.error(
						"Cannot run .include() on an object without an ID or model name.",
					);
					return receiver; // Return the proxy itself for chaining.
				}

				if (!(target._modelName in $APP.models))
					throw new Error(
						\`Model \${target._modelName} does not exist in models\`,
					);

				const model = $APP.models[target._modelName];
				const prop = model[include];
				if (!prop)
					throw new Error(
						\`Relationship '\${include}' not found in \${target._modelName} model\`,
					);
				const freshData = await Model.request("GET_MANY", prop.targetModel, {
					opts: {
						filter: prop.belongs
							? target[include]
							: { [prop.targetForeignKey]: target.id },
					},
				});
				target[include] = proxifyMultipleRows(freshData, prop.targetModel);

				return receiver;
			};
		}
		return target[prop];
	},

	set(target, prop, value) {
		target[prop] = value;
		return true;
	},
};

const handleModelRequest = async ({ modelName, action, payload }) => {
	const result = await Model.request(action, modelName, payload);
	if (action === "ADD_MANY" && result && Array.isArray(result.results)) {
		result.results.forEach((res) => {
			if (res.status === "fulfilled" && res.value) {
				res.value = proxifyRow(res.value, modelName);
			}
		});
		return result;
	}

	if (action.includes("MANY")) {
		if (payload.opts.object) return result;
		if (result?.items) {
			result.items = proxifyMultipleRows(result.items, modelName);
			return result;
		}
		return proxifyMultipleRows(result, modelName);
	}

	return proxifyRow(result, modelName);
};

const getMethodRegistry = (modelName) => [
	{
		type: "static",
		name: "get",
		handler: (id, opts = {}) =>
			handleModelRequest({
				modelName,
				action: "GET",
				payload: id ? { id, opts } : { opts },
			}),
	},
	{
		type: "static",
		name: "getAll",
		handler: (opts = {}) =>
			handleModelRequest({
				modelName,
				action: "GET_MANY",
				payload: { opts },
			}),
	},
	{
		type: "static",
		name: "add",
		handler: (row, opts) =>
			handleModelRequest({
				modelName,
				action: "ADD",
				payload: { row, opts },
			}),
	},
	{
		type: "static",
		name: "addMany",
		handler: (rows, opts) =>
			handleModelRequest({
				modelName,
				action: "ADD_MANY",
				payload: { rows, opts },
			}),
	},
	{
		type: "static",
		name: "remove",
		handler: (id) => Model.request("REMOVE", modelName, { id }),
	},
	{
		type: "static",
		name: "removeAll",
		handler: (filter) =>
			Model.request("REMOVE_MANY", modelName, { opts: { filter } }),
	},
	{
		type: "static",
		name: "edit",
		handler: (row) =>
			handleModelRequest({
				modelName,
				action: "EDIT",
				payload: { row },
			}),
	},
	{
		type: "static",
		name: "editAll",
		handler: (filter, updates) =>
			Model.request("EDIT_MANY", modelName, { opts: { filter, updates } }),
	},
	{
		type: "static",
		name: "upsert",
		handler: (row, opts) =>
			handleModelRequest({
				modelName,
				action: row?.id ? "EDIT" : "ADD",
				payload: { row, opts },
			}),
	},
	{ type: "dynamic", prefix: "getBy", action: "GET" },
	{ type: "dynamic", prefix: "getAllBy", action: "GET_MANY" },
	{ type: "dynamic", prefix: "editAllBy", action: "EDIT_MANY" },
	{ type: "dynamic", prefix: "editBy", action: "EDIT" },
	{ type: "dynamic", prefix: "removeBy", action: "REMOVE" },
	{ type: "dynamic", prefix: "removeAllBy", action: "REMOVE_MANY" },
];

const proxifyRow = (row, modelName) => {
	if (!row || typeof row !== "object" || row.errors) return row;
	Model[modelName].rows[row.id] = row;
	Model[modelName].on(\`get:\${row.id}\`, (data) => {
		if (data === undefined) {
			delete Model[modelName].rows[row.id];
			return;
		}
		const { id, ...newRow } = data;
		Object.assign(Model[modelName].rows[row.id], newRow);
	});
	row._modelName = modelName;
	return new Proxy(Model[modelName].rows[row.id], instanceProxyHandler);
};

const proxifyMultipleRows = (rows, modelName) => {
	if (!Array.isArray(rows)) return rows;
	return rows.map((row) => proxifyRow(row, modelName));
};

const uncapitalize = (str) => {
	if (typeof str !== "string" || !str) return str;
	return str.charAt(0).toLowerCase() + str.slice(1);
};

const modelApiCache = new Map();
const Model = new Proxy(
	{},
	{
		get(target, prop, receiver) {
			if (prop in target) return Reflect.get(target, prop, receiver);
			if (modelApiCache.has(prop)) return modelApiCache.get(prop);
			const modelName = prop;
			if (!(prop in $APP.models)) {
				throw new Error(\`Model \${modelName} does not exist in models\`);
			}
			const modelSchema = $APP.models[modelName];
			const methodRegistry = getMethodRegistry(modelName, modelSchema);
			const modelApi = new Proxy(
				{},
				{
					get(target, methodName, modelReceiver) {
						if (methodName in target)
							return Reflect.get(target, methodName, modelReceiver);
						for (const definition of methodRegistry) {
							if (
								definition.type === "static" &&
								definition.name === methodName
							)
								return definition.handler;

							if (
								definition.type === "dynamic" &&
								methodName.startsWith(definition.prefix)
							) {
								const property = methodName.slice(definition.prefix.length);
								if (!property) continue;

								const propertyKey = uncapitalize(property);

								if (!(propertyKey in modelSchema))
									throw new Error(
										\`Property '\${propertyKey}' not found in model '\${modelName}'\`,
									);

								return (value, row = null) => {
									const payload = {
										opts: { filter: { [propertyKey]: value } },
									};
									if (row) payload.opts.row = row;

									return handleModelRequest({
										modelName,
										action: definition.action,
										payload,
									});
								};
							}
						}
						throw new Error(
							\`Method '\${methodName}' not found in model '\${modelName}'\`,
						);
					},
				},
			);

			$APP.events.install(modelApi);

			modelApi.rows = $APP.storage.install({});
			modelApiCache.set(prop, modelApi);
			return modelApi;
		},
	},
);
Model.proxifyRow = proxifyRow;
Model.proxifyMultipleRows = proxifyMultipleRows;
Model.addModels = addModels;
export default Model;
`,mimeType:"application/javascript",skipSW:!1},"/modules/mvc/controller/backend/worker.js":{content:`export default ({ $APP, Database }) => {
	const generateId = (() => {
		let lastTimestamp = 0;
		let sequentialCounter = 0;
		return () => {
			let now = Date.now();
			if (now > lastTimestamp) {
				sequentialCounter = 0;
			} else {
				sequentialCounter++;
				now += sequentialCounter;
			}
			lastTimestamp = now;
			return now.toString();
		};
	})();

	let nextRequestId = 1;
	const pendingRequests = {};
	const pendingBackendRequests = {};

	const requestFromClient = async (type, payload, timeout = 5000) => {
		const clients = await self.clients.matchAll({
			type: "window",
			includeUncontrolled: true,
		});
		const client = clients[0]; // Simple strategy: pick the first client.

		if (!client) {
			return Promise.reject(
				new Error("No active client found to send request to."),
			);
		}

		const eventId = \`backend-request-\${nextRequestId++}\`;

		return new Promise((resolve, reject) => {
			pendingBackendRequests[eventId] = { resolve, reject };
			setTimeout(() => {
				delete pendingBackendRequests[eventId];
				reject(new Error(\`Request timed out after \${timeout}ms\`));
			}, timeout);
			client.postMessage({
				type,
				payload,
				eventId,
			});
		});
	};

	const broadcast = async (params) => {
		if (!$APP.Backend.client) return;
		$APP.Backend.client.postMessage(params);
		$APP.Backend.client.postMessage({ type: "BROADCAST", params });
	};

	const handleMessage = async ({ data, respond }) => {
		const { events } = $APP;
		const { type, payload, connection, eventId } = data;
		if (pendingBackendRequests[eventId]) {
			const promise = pendingBackendRequests[eventId];
			promise.resolve(payload);
			delete pendingBackendRequests[eventId];
			return;
		}

		if (connection) {
			if (!pendingRequests[eventId]) {
				$APP.mv3.postMessage(data, connection);
				pendingRequests[eventId] = respond;
			} else pendingRequests[eventId].postMessage(data);
			return;
		}

		const handler = events[type];
		if (!handler) return;
		await handler({
			payload,
			eventId,
			respond,
			client: createClientProxy($APP.Backend.client),
			broadcast,
		});
	};

	const createClientProxy = (client) => {
		return new Proxy(
			{},
			{
				get: (target, prop) => {
					return (payload) => sendRequestToClient(client, prop, payload);
				},
			},
		);
	};

	const sendRequestToClient = (client, type, payload) => {
		const eventId = \`sw_\${nextRequestId++}\`;
		return new Promise((resolve, reject) => {
			pendingBackendRequests[eventId] = { resolve, reject };
			client.postMessage({ type, payload, eventId });
		});
	};

	function createModelAdder({ $APP, getApp, debounceDelay = 50 }) {
		let debounceTimer;
		const processModelAdditions = async () => {
			if (!$APP.dynamicModels.length) return;
			$APP.log(\`Batch processing \${$APP.dynamicModels.length} model(s)...\`);

			try {
				const { SysModel } = $APP;
				const app = await getApp();
				app.version++;
				app.models = $APP.models;
				await SysModel.edit($APP.settings.sysmodels.APP, app);
				$APP.log(
					\`Batch add successful. \${$APP.dynamicModels.length} model(s) added. App version is now \${app.version}.\`,
				);

				await Database.reload({
					models: app.models,
					version: app.version,
				});
				const env = await setupAppEnvironment(app);
				await migrateData(Object.fromEntries($APP.dynamicData), {
					skipDynamicCheck: true,
				});
				await $APP.hooks.emit("APP:STARTED", env);
			} catch (error) {
				console.error("Failed to process model additions batch:", error);
			}
		};

		$APP.addModule({ name: "dynamicModels", base: [] });
		$APP.addModule({ name: "dynamicData", base: [] });

		return function addModel({ name, schema }) {
			if (!$APP.dynamicModels.includes(name)) $APP.dynamicModels.add(name);
			if (!name || !schema)
				throw new Error("A model 'name' and 'schema' are required.");
			$APP.log(\`Model "\${name}" queued for addition.\`);
			$APP.models.set({ [name]: schema });
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(processModelAdditions, debounceDelay);
		};
	}

	const createAppEntry = async ({
		timestamp = Date.now(),
		id = timestamp.toString(),
		models = $APP.models,
		version = 1,
	} = {}) => {
		const app = {
			id,
			version,
			active: true,
			models,
		};

		await $APP.SysModel.add($APP.settings.sysmodels.APP, app);
		$APP.hooks.emit("APP:CREATED", {
			app,
		});
		return app;
	};

	async function generateKeyPair() {
		const keyPair = await self.crypto.subtle.generateKey(
			{
				name: "RSA-OAEP",
				modulusLength: 2048,
				publicExponent: new Uint8Array([1, 0, 1]),
				hash: "SHA-256",
			},
			true,
			["encrypt", "decrypt"],
		);

		const publicKey = await self.crypto.subtle.exportKey(
			"spki",
			keyPair.publicKey,
		);
		const privateKey = await self.crypto.subtle.exportKey(
			"pkcs8",
			keyPair.privateKey,
		);

		return {
			publicKey: btoa(String.fromCharCode(...new Uint8Array(publicKey))),
			privateKey: btoa(String.fromCharCode(...new Uint8Array(privateKey))),
		};
	}

	const createUserEntry = async ({ app: _app, device, user } = {}) => {
		const app = _app || (await $APP.Backend.getApp());
		if (!user) {
			const existingUser = await $APP.SysModel.get(
				$APP.settings.sysmodels.USER,
				{
					active: true,
					appId: app.id,
				},
			);

			if (existingUser) {
				existingUser.privateKey = null;
				const existingDevice = await $APP.SysModel.get(
					$APP.settings.sysmodels.DEVICE,
					{
						userId: existingUser.id,
						active: true,
					},
				);
				if (!existingDevice)
					await $APP.SysModel.add($APP.settings.sysmodels.DEVICE, device);
				return existingUser;
			}
		}

		const { publicKey, privateKey } = await generateKeyPair();
		const newUser = user || {
			id: user?.id || generateId(),
			name: user?.name || "Local User",
			publicKey,
			privateKey,
			appId: app.id,
			active: true,
		};
		await $APP.SysModel.add($APP.settings.sysmodels.USER, newUser);

		const newDevice = device || {
			userId: newUser.id,
			appId: app.id,
			active: true,
		};
		await $APP.SysModel.add($APP.settings.sysmodels.DEVICE, newDevice);
		newUser.privateKey = null;
		return newUser;
	};

	const getApp = async () => {
		return await $APP.SysModel.get($APP.settings.sysmodels.APP, {
			active: true,
		});
	};

	const getUser = async (_app) => {
		if ($APP.Backend.user) return $APP.Backend.user;
		const app = _app || (await $APP.Backend.getApp());
		if ($APP.Backend.user && $APP.Backend.user.appId !== app.id) {
			$APP.Backend.user = null;
		}

		if (!$APP.Backend.user) {
			let puser = await $APP.SysModel.get($APP.settings.sysmodels.USER, {
				appId: app.id,
				active: true,
			});
			if (!puser)
				puser = await $APP.Backend.createUserEntry({
					app,
				});
			const { privateKey, active, ...user } = puser;
			$APP.Backend.user = user;
		}
		return $APP.Backend.user;
	};

	const getDevice = async ({ app: _app, user: _user } = {}) => {
		const app = _app || (await $APP.Backend.getApp());
		const user = _user || (await $APP.Backend.getUser(app));
		if (!user) throw new Error("User not found");
		const device = await $APP.SysModel.get($APP.settings.sysmodels.DEVICE, {
			userId: user.id,
			active: true,
		});
		return device || null;
	};

	const migrateData = async (_data, opts = {}) => {
		const { skipDynamicCheck = false } = opts;
		const data = _data ?? $APP.data;
		const { SysModel } = $APP;
		const app = await getApp();
		const appsData = Object.entries(data);
		if (appsData.length) {
			const dump = {};
			for (const [modelName, entries] of appsData) {
				if (!skipDynamicCheck && !$APP.models[modelName])
					$APP.dynamicData.add([modelName, entries]);
				else dump[modelName] = entries;
			}
			Database.loadDBDump({ dump, app });

			Database.app = await SysModel.edit($APP.settings.sysmodels.APP, {
				id: app.id,
				migrationTimestamp: Date.now(),
			});
		}
	};

	$APP.DatabaseExtensions;
	const setupAppEnvironment = async (app) => {
		Database.app = app;
		const extensions = [];
		app.models ??= {};
		Object.values(app.models).forEach((modelSchema) =>
			Object.keys(modelSchema).forEach((prop) => {
				if (prop.startsWith("$")) {
					extensions.push(prop.slice(1));
				}
			}),
		);
		await Database.reload({
			name: app.id,
			models: app.models,
			version: app.version,
			extensions,
		});
		const { active, privateKey, ...user } = await getUser(app);
		const device = await getDevice({
			app,
			user,
		});
		if ($APP.data && !app.migrationTimestamp) {
			await migrateData($APP.data);
			app = await getApp();
		}

		return {
			app,
			user,
			device,
			models: app.models,
		};
	};

	const addModel = createModelAdder({
		$APP,
		getApp,
	});

	const Backend = {
		bootstrap: async () => {
			let app = await getApp();
			if (!app) {
				app = await createAppEntry();
			}
			const env = await setupAppEnvironment(app);
			if (!$APP.dynamicModels.length) {
				await $APP.hooks.on("APP:DATABASE_STARTED", async () => {
					await $APP.hooks.emit("APP:STARTED", env);
				});
			}
			await $APP.hooks.emit("APP:BACKEND_STARTED", env);
			return env;
		},
		handleMessage,
		getApp,
		getDevice,
		createAppEntry,
		createUserEntry,
		getUser,
		generateId,
		broadcast,
		addModel,
		requestFromClient,
	};

	$APP.events.set({
		INIT_APP: async ({ respond }) => {
			await $APP.hooks.on(
				"APP:STARTED",
				async ({ app, user, device, models }) => {
					respond({ app, user, device, models });
				},
			);
		},
		GET_CURRENT_APP: async ({ respond }) => {
			const app = await $APP.Backend.getApp();
			respond(app);
		},
		LIST_APPS: async ({ respond }) => {
			const apps = await $APP.SysModel.getMany($APP.settings.sysmodels.APP);
			respond(apps || []);
		},
		CREATE_APP: async ({ respond }) => {
			const currentApp = await $APP.Backend.getApp();
			if (currentApp) {
				await $APP.SysModel.edit($APP.settings.sysmodels.APP, {
					id: currentApp.id,
					active: false,
				});
			}

			const newApp = await $APP.Backend.createAppEntry();
			const env = await setupAppEnvironment(newApp);
			respond(env.app);
		},
		SELECT_APP: async ({ payload, respond }) => {
			const { appId } = payload;
			if (!appId) {
				return respond({
					error: "An 'appId' is required to select an app.",
				});
			}

			const currentApp = await $APP.Backend.getApp();
			if (currentApp && currentApp.id !== appId) {
				await $APP.SysModel.edit($APP.settings.sysmodels.APP, {
					id: currentApp.id,
					active: false,
				});
			}

			await $APP.SysModel.edit($APP.settings.sysmodels.APP, {
				id: appId,
				active: true,
			});

			const selectedApp = await $APP.SysModel.get($APP.settings.sysmodels.APP, {
				id: appId,
			});

			const env = await setupAppEnvironment(selectedApp);
			respond(env.app);
		},

		GET_DB_DUMP: async ({ respond }) => {
			const dump = await Database.createDBDump();
			respond(dump);
		},

		LOAD_DB_DUMP: async ({ payload, respond = console.log }) => {
			try {
				Database.loadDBDump(payload);
				respond({ success: true });
			} catch (error) {
				console.error("Failed to load DB dump:", error);
				respond({ success: false, error });
			}
		},
	});

	return Backend;
};
`,mimeType:"application/javascript",skipSW:!1},"/models/migration.js":{content:`export const version = 1;

export default ({ T, $APP }) => {
	$APP.models.set({
		sessions: {
			count: T.number({ required: true }),
			date: T.string({ required: true, index: true }),
			timestamp: T.string({ required: true, index: true }),
		},
	});
};
`,mimeType:"application/javascript",skipSW:!1},"/modules/apps/bundler/models/migration.js":{content:`import $APP from "/bootstrap.js";
import T from "/modules/types/index.js";

$APP.data.set({
	credentials: [
		{
			id: "singleton",
			owner: "meiraleal",
			branch: "main",
			repo: "brazuka.dev",
			token: "",
		},
	],
});

$APP.models.set({
	credentials: {
		owner: T.string(),
		repo: T.string(),
		branch: T.string({ defaultValue: "main" }),
		token: T.string(),
	},
	releases: {
		version: T.string({
			index: true,
		}),
		notes: T.string(),
		status: T.string({
			enum: ["pending", "success", "failed"],
			defaultValue: "pending",
		}),
		deployedAt: T.string(),
		files: T.array(),
	},
});
`,mimeType:"application/javascript",skipSW:!1},"/theme.css":{content:`body {
	font-family: var(--font-family);
}

html,
body {
	font-family: var(--theme-font-family);
	background-color: var(--theme-background-color) !important;
	color: var(--text-color) !important;
	width: 100%;
	min-height: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
}

body:not(.production) *:not(:defined) {
	border: 1px solid red;
}

.dark {
	filter: invert(1) hue-rotate(180deg);
}

.dark img,
.dark dialog,
.dark video,
.dark iframe {
	filter: invert(1) hue-rotate(180deg);
}

html {
	font-size: 14px;
}

@media (max-width: 768px) {
	html {
		font-size: 18px;
	}
}

@media (max-width: 480px) {
	html {
		font-size: 20px;
	}
}

textarea {
	font-family: inherit;
	font-feature-settings: inherit;
	font-variation-settings: inherit;
	font-size: 100%;
	font-weight: inherit;
	line-height: inherit;
	color: inherit;
	margin: 0;
	padding: 0;
}

:root {
	box-sizing: border-box;
	-moz-text-size-adjust: none;
	-webkit-text-size-adjust: none;
	text-size-adjust: none;
	line-height: 1.2;
	-webkit-font-smoothing: antialiased;
}
*,
*::before,
*::after {
	box-sizing: border-box;
}
* {
	margin: 0;
}
body {
	-webkit-font-smoothing: antialiased;
	font-family: var(--font-family);
}

button,
textarea,
select {
	background-color: inherit;
	border-width: 0;
	color: inherit;
}
img,
picture,
video,
canvas,
svg {
	display: block;
	max-width: 100%;
}
input,
button,
textarea,
select {
	font: inherit;
}
p,
h1,
h2,
h3,
h4,
h5,
h6 {
	font-family: var(--font-family);
	overflow-wrap: break-word;
}

dialog::backdrop {
	background-color: rgba(0, 0, 0, 0.8);
}

*::-webkit-scrollbar {
	width: 8px;
	margin-right: 10px;
}

*::-webkit-scrollbar-track {
	background: transparent;
}

*::-webkit-scrollbar-thumb {
	&:hover {
		scrollbar-color: rgba(154, 153, 150, 0.8) transparent;
	}
	border-radius: 10px;
	border: none;
}

*::-webkit-scrollbar-button {
	background: transparent;
	color: transparent;
}

* {
	scrollbar-width: thin;
	scrollbar-color: transparent transparent;
	&:hover {
		scrollbar-color: rgba(154, 153, 150, 0.8) transparent;
	}
}

[full] {
	width: 100%;
	height: 100vh;
}

[w-full] {
	width: 100%;
}

[grow] {
	flex-grow: 1;
}

[hide] {
	display: none !important;
}

.hide {
	display: none !important;
}

[noscroll] {
	overflow: hidden;
}

div [container] {
	display: flex;
}

div [container][horizontal] {
	display: flex;
	flex-direction: col;
}
`,mimeType:"text/css",skipSW:!1},"/modules/app/container.js":{content:`export default ({ routes, T }) => ({
	tag: "app-container",
	class: "flex flex-grow",
	extends: "router-ui",
	properties: {
		routes: T.object({ defaultValue: routes }),
		full: T.boolean(true),
	},
});
`,mimeType:"application/javascript",skipSW:!1},"/modules/router/ui.js":{content:`export default ({ html, T }) => ({
	tag: "router-ui",
	properties: {
		currentRoute: T.object({
			sync: "ram",
		}),
	},
	renderRoute(route, params) {
		const component =
			typeof route.component === "function"
				? route.component(params)
				: route.component;
		return route.template
			? html.staticHTML\`<\${html.unsafeStatic(route.template)} .component=\${component}>
			</\${html.unsafeStatic(route.template)}>\`
			: component;
	},

	render() {
		const { route, params } = this.currentRoute || {};
		return route
			? this.renderRoute(
					typeof route === "function" ? { component: route } : route,
					params,
				)
			: html\`404: Page not found\`;
	},
});
`,mimeType:"application/javascript",skipSW:!1},"/modules/uix/feedback/spinner.js":{content:`export default ({ html }) => ({
	tag: "uix-spinner",
	style: true,
	render() {
		return html\`
		<div class="uix-spinner_container">
			<span
				class="uix-spinner__element"
			>
			</span>
	</div>
    \`;
	},
});
`,mimeType:"application/javascript",skipSW:!1},"/modules/uix/feedback/spinner.css":{content:`.uix-spinner {
	display: flex;
	width: 100%;
	height: 100%;
	align-items: center;
	justify-content: center;

	.uix-spinner_container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		align-items: center;
		justify-content: center;
	}

	.uix-spinner__element {
		width: 7rem;
		height: 7rem;
		border-width: 8px;
		border-style: solid;
		border-color: #d1d5db;
		border-top-color: #3b82f6;
		color: #3b82f6;
		font-size: 2.25rem;
		animation: spin 1s linear infinite;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
}
`,mimeType:"text/css",skipSW:!1},"/style.css":{content:`@font-face{font-family:Manrope;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk79FN_P-bnBeA.woff2) format("woff2");unicode-range:U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F}@font-face{font-family:Manrope;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk79FN_G-bnBeA.woff2) format("woff2");unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}@font-face{font-family:Manrope;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk79FN_B-bnBeA.woff2) format("woff2");unicode-range:U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF}@font-face{font-family:Manrope;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk79FN_N-bnBeA.woff2) format("woff2");unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB}@font-face{font-family:Manrope;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk79FN_M-bnBeA.woff2) format("woff2");unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}@font-face{font-family:Manrope;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk79FN_C-bk.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--un-bg-opacity:100%;--un-text-opacity:100%}}@property --un-text-opacity{syntax:"<percentage>";inherits:false;initial-value:100%;}@property --un-bg-opacity{syntax:"<percentage>";inherits:false;initial-value:100%;}@property --un-inset-ring-color{syntax:"*";inherits:false;}@property --un-inset-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000;}@property --un-inset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000;}@property --un-inset-shadow-color{syntax:"*";inherits:false;}@property --un-ring-color{syntax:"*";inherits:false;}@property --un-ring-inset{syntax:"*";inherits:false;}@property --un-ring-offset-color{syntax:"*";inherits:false;}@property --un-ring-offset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000;}@property --un-ring-offset-width{syntax:"<length>";inherits:false;initial-value:0px;}@property --un-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000;}@property --un-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000;}@property --un-shadow-color{syntax:"*";inherits:false;}:root,:host{--spacing: .25rem;--font-sans: "Manrope",ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";--font-serif: ui-serif,Georgia,Cambria,"Times New Roman",Times,serif;--font-mono: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;--font-family: "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;--font-icon-family: lucide;--colors-black: #000;--colors-white: #fff;--colors-slate-50: oklch(98.4% .003 247.858);--colors-slate-100: oklch(96.8% .007 247.896);--colors-slate-200: oklch(92.9% .013 255.508);--colors-slate-300: oklch(86.9% .022 252.894);--colors-slate-400: oklch(70.4% .04 256.788);--colors-slate-500: oklch(55.4% .046 257.417);--colors-slate-600: oklch(44.6% .043 257.281);--colors-slate-700: oklch(37.2% .044 257.287);--colors-slate-800: oklch(27.9% .041 260.031);--colors-slate-900: oklch(20.8% .042 265.755);--colors-slate-950: oklch(12.9% .042 264.695);--colors-slate-DEFAULT: oklch(70.4% .04 256.788);--colors-gray-50: oklch(98.5% .002 247.839);--colors-gray-100: oklch(96.7% .003 264.542);--colors-gray-200: oklch(92.8% .006 264.531);--colors-gray-300: oklch(87.2% .01 258.338);--colors-gray-400: oklch(70.7% .022 261.325);--colors-gray-500: oklch(55.1% .027 264.364);--colors-gray-600: oklch(44.6% .03 256.802);--colors-gray-700: oklch(37.3% .034 259.733);--colors-gray-800: oklch(27.8% .033 256.848);--colors-gray-900: oklch(21% .034 264.665);--colors-gray-950: oklch(13% .028 261.692);--colors-gray-DEFAULT: oklch(70.7% .022 261.325);--colors-zinc-50: oklch(98.5% 0 0);--colors-zinc-100: oklch(96.7% .001 286.375);--colors-zinc-200: oklch(92% .004 286.32);--colors-zinc-300: oklch(87.1% .006 286.286);--colors-zinc-400: oklch(70.5% .015 286.067);--colors-zinc-500: oklch(55.2% .016 285.938);--colors-zinc-600: oklch(44.2% .017 285.786);--colors-zinc-700: oklch(37% .013 285.805);--colors-zinc-800: oklch(27.4% .006 286.033);--colors-zinc-900: oklch(21% .006 285.885);--colors-zinc-950: oklch(14.1% .005 285.823);--colors-zinc-DEFAULT: oklch(70.5% .015 286.067);--colors-neutral-50: oklch(98.5% 0 0);--colors-neutral-100: oklch(97% 0 0);--colors-neutral-200: oklch(92.2% 0 0);--colors-neutral-300: oklch(87% 0 0);--colors-neutral-400: oklch(70.8% 0 0);--colors-neutral-500: oklch(55.6% 0 0);--colors-neutral-600: oklch(43.9% 0 0);--colors-neutral-700: oklch(37.1% 0 0);--colors-neutral-800: oklch(26.9% 0 0);--colors-neutral-900: oklch(20.5% 0 0);--colors-neutral-950: oklch(14.5% 0 0);--colors-neutral-DEFAULT: oklch(70.8% 0 0);--colors-stone-50: oklch(98.5% .001 106.423);--colors-stone-100: oklch(97% .001 106.424);--colors-stone-200: oklch(92.3% .003 48.717);--colors-stone-300: oklch(86.9% .005 56.366);--colors-stone-400: oklch(70.9% .01 56.259);--colors-stone-500: oklch(55.3% .013 58.071);--colors-stone-600: oklch(44.4% .011 73.639);--colors-stone-700: oklch(37.4% .01 67.558);--colors-stone-800: oklch(26.8% .007 34.298);--colors-stone-900: oklch(21.6% .006 56.043);--colors-stone-950: oklch(14.7% .004 49.25);--colors-stone-DEFAULT: oklch(70.9% .01 56.259);--colors-red-50: oklch(97.1% .013 17.38);--colors-red-100: oklch(93.6% .032 17.717);--colors-red-200: oklch(88.5% .062 18.334);--colors-red-300: oklch(80.8% .114 19.571);--colors-red-400: oklch(70.4% .191 22.216);--colors-red-500: oklch(63.7% .237 25.331);--colors-red-600: oklch(57.7% .245 27.325);--colors-red-700: oklch(50.5% .213 27.518);--colors-red-800: oklch(44.4% .177 26.899);--colors-red-900: oklch(39.6% .141 25.723);--colors-red-950: oklch(25.8% .092 26.042);--colors-red-DEFAULT: oklch(70.4% .191 22.216);--colors-orange-50: oklch(98% .016 73.684);--colors-orange-100: oklch(95.4% .038 75.164);--colors-orange-200: oklch(90.1% .076 70.697);--colors-orange-300: oklch(83.7% .128 66.29);--colors-orange-400: oklch(75% .183 55.934);--colors-orange-500: oklch(70.5% .213 47.604);--colors-orange-600: oklch(64.6% .222 41.116);--colors-orange-700: oklch(55.3% .195 38.402);--colors-orange-800: oklch(47% .157 37.304);--colors-orange-900: oklch(40.8% .123 38.172);--colors-orange-950: oklch(26.6% .079 36.259);--colors-orange-DEFAULT: oklch(75% .183 55.934);--colors-amber-50: oklch(98.7% .022 95.277);--colors-amber-100: oklch(96.2% .059 95.617);--colors-amber-200: oklch(92.4% .12 95.746);--colors-amber-300: oklch(87.9% .169 91.605);--colors-amber-400: oklch(82.8% .189 84.429);--colors-amber-500: oklch(76.9% .188 70.08);--colors-amber-600: oklch(66.6% .179 58.318);--colors-amber-700: oklch(55.5% .163 48.998);--colors-amber-800: oklch(47.3% .137 46.201);--colors-amber-900: oklch(41.4% .112 45.904);--colors-amber-950: oklch(27.9% .077 45.635);--colors-amber-DEFAULT: oklch(82.8% .189 84.429);--colors-yellow-50: oklch(98.7% .026 102.212);--colors-yellow-100: oklch(97.3% .071 103.193);--colors-yellow-200: oklch(94.5% .129 101.54);--colors-yellow-300: oklch(90.5% .182 98.111);--colors-yellow-400: oklch(85.2% .199 91.936);--colors-yellow-500: oklch(79.5% .184 86.047);--colors-yellow-600: oklch(68.1% .162 75.834);--colors-yellow-700: oklch(55.4% .135 66.442);--colors-yellow-800: oklch(47.6% .114 61.907);--colors-yellow-900: oklch(42.1% .095 57.708);--colors-yellow-950: oklch(28.6% .066 53.813);--colors-yellow-DEFAULT: oklch(85.2% .199 91.936);--colors-lime-50: oklch(98.6% .031 120.757);--colors-lime-100: oklch(96.7% .067 122.328);--colors-lime-200: oklch(93.8% .127 124.321);--colors-lime-300: oklch(89.7% .196 126.665);--colors-lime-400: oklch(84.1% .238 128.85);--colors-lime-500: oklch(76.8% .233 130.85);--colors-lime-600: oklch(64.8% .2 131.684);--colors-lime-700: oklch(53.2% .157 131.589);--colors-lime-800: oklch(45.3% .124 130.933);--colors-lime-900: oklch(40.5% .101 131.063);--colors-lime-950: oklch(27.4% .072 132.109);--colors-lime-DEFAULT: oklch(84.1% .238 128.85);--colors-green-50: oklch(98.2% .018 155.826);--colors-green-100: oklch(96.2% .044 156.743);--colors-green-200: oklch(92.5% .084 155.995);--colors-green-300: oklch(87.1% .15 154.449);--colors-green-400: oklch(79.2% .209 151.711);--colors-green-500: oklch(72.3% .219 149.579);--colors-green-600: oklch(62.7% .194 149.214);--colors-green-700: oklch(52.7% .154 150.069);--colors-green-800: oklch(44.8% .119 151.328);--colors-green-900: oklch(39.3% .095 152.535);--colors-green-950: oklch(26.6% .065 152.934);--colors-green-DEFAULT: oklch(79.2% .209 151.711);--colors-emerald-50: oklch(97.9% .021 166.113);--colors-emerald-100: oklch(95% .052 163.051);--colors-emerald-200: oklch(90.5% .093 164.15);--colors-emerald-300: oklch(84.5% .143 164.978);--colors-emerald-400: oklch(76.5% .177 163.223);--colors-emerald-500: oklch(69.6% .17 162.48);--colors-emerald-600: oklch(59.6% .145 163.225);--colors-emerald-700: oklch(50.8% .118 165.612);--colors-emerald-800: oklch(43.2% .095 166.913);--colors-emerald-900: oklch(37.8% .077 168.94);--colors-emerald-950: oklch(26.2% .051 172.552);--colors-emerald-DEFAULT: oklch(76.5% .177 163.223);--colors-teal-50: oklch(98.4% .014 180.72);--colors-teal-100: oklch(95.3% .051 180.801);--colors-teal-200: oklch(91% .096 180.426);--colors-teal-300: oklch(85.5% .138 181.071);--colors-teal-400: oklch(77.7% .152 181.912);--colors-teal-500: oklch(70.4% .14 182.503);--colors-teal-600: oklch(60% .118 184.704);--colors-teal-700: oklch(51.1% .096 186.391);--colors-teal-800: oklch(43.7% .078 188.216);--colors-teal-900: oklch(38.6% .063 188.416);--colors-teal-950: oklch(27.7% .046 192.524);--colors-teal-DEFAULT: oklch(77.7% .152 181.912);--colors-cyan-50: oklch(98.4% .019 200.873);--colors-cyan-100: oklch(95.6% .045 203.388);--colors-cyan-200: oklch(91.7% .08 205.041);--colors-cyan-300: oklch(86.5% .127 207.078);--colors-cyan-400: oklch(78.9% .154 211.53);--colors-cyan-500: oklch(71.5% .143 215.221);--colors-cyan-600: oklch(60.9% .126 221.723);--colors-cyan-700: oklch(52% .105 223.128);--colors-cyan-800: oklch(45% .085 224.283);--colors-cyan-900: oklch(39.8% .07 227.392);--colors-cyan-950: oklch(30.2% .056 229.695);--colors-cyan-DEFAULT: oklch(78.9% .154 211.53);--colors-sky-50: oklch(97.7% .013 236.62);--colors-sky-100: oklch(95.1% .026 236.824);--colors-sky-200: oklch(90.1% .058 230.902);--colors-sky-300: oklch(82.8% .111 230.318);--colors-sky-400: oklch(74.6% .16 232.661);--colors-sky-500: oklch(68.5% .169 237.323);--colors-sky-600: oklch(58.8% .158 241.966);--colors-sky-700: oklch(50% .134 242.749);--colors-sky-800: oklch(44.3% .11 240.79);--colors-sky-900: oklch(39.1% .09 240.876);--colors-sky-950: oklch(29.3% .066 243.157);--colors-sky-DEFAULT: oklch(74.6% .16 232.661);--colors-blue-50: oklch(97% .014 254.604);--colors-blue-100: oklch(93.2% .032 255.585);--colors-blue-200: oklch(88.2% .059 254.128);--colors-blue-300: oklch(80.9% .105 251.813);--colors-blue-400: oklch(70.7% .165 254.624);--colors-blue-500: oklch(62.3% .214 259.815);--colors-blue-600: oklch(54.6% .245 262.881);--colors-blue-700: oklch(48.8% .243 264.376);--colors-blue-800: oklch(42.4% .199 265.638);--colors-blue-900: oklch(37.9% .146 265.522);--colors-blue-950: oklch(28.2% .091 267.935);--colors-blue-DEFAULT: oklch(70.7% .165 254.624);--colors-indigo-50: oklch(96.2% .018 272.314);--colors-indigo-100: oklch(93% .034 272.788);--colors-indigo-200: oklch(87% .065 274.039);--colors-indigo-300: oklch(78.5% .115 274.713);--colors-indigo-400: oklch(67.3% .182 276.935);--colors-indigo-500: oklch(58.5% .233 277.117);--colors-indigo-600: oklch(51.1% .262 276.966);--colors-indigo-700: oklch(45.7% .24 277.023);--colors-indigo-800: oklch(39.8% .195 277.366);--colors-indigo-900: oklch(35.9% .144 278.697);--colors-indigo-950: oklch(25.7% .09 281.288);--colors-indigo-DEFAULT: oklch(67.3% .182 276.935);--colors-violet-50: oklch(96.9% .016 293.756);--colors-violet-100: oklch(94.3% .029 294.588);--colors-violet-200: oklch(89.4% .057 293.283);--colors-violet-300: oklch(81.1% .111 293.571);--colors-violet-400: oklch(70.2% .183 293.541);--colors-violet-500: oklch(60.6% .25 292.717);--colors-violet-600: oklch(54.1% .281 293.009);--colors-violet-700: oklch(49.1% .27 292.581);--colors-violet-800: oklch(43.2% .232 292.759);--colors-violet-900: oklch(38% .189 293.745);--colors-violet-950: oklch(28.3% .141 291.089);--colors-violet-DEFAULT: oklch(70.2% .183 293.541);--colors-purple-50: oklch(97.7% .014 308.299);--colors-purple-100: oklch(94.6% .033 307.174);--colors-purple-200: oklch(90.2% .063 306.703);--colors-purple-300: oklch(82.7% .119 306.383);--colors-purple-400: oklch(71.4% .203 305.504);--colors-purple-500: oklch(62.7% .265 303.9);--colors-purple-600: oklch(55.8% .288 302.321);--colors-purple-700: oklch(49.6% .265 301.924);--colors-purple-800: oklch(43.8% .218 303.724);--colors-purple-900: oklch(38.1% .176 304.987);--colors-purple-950: oklch(29.1% .149 302.717);--colors-purple-DEFAULT: oklch(71.4% .203 305.504);--colors-fuchsia-50: oklch(97.7% .017 320.058);--colors-fuchsia-100: oklch(95.2% .037 318.852);--colors-fuchsia-200: oklch(90.3% .076 319.62);--colors-fuchsia-300: oklch(83.3% .145 321.434);--colors-fuchsia-400: oklch(74% .238 322.16);--colors-fuchsia-500: oklch(66.7% .295 322.15);--colors-fuchsia-600: oklch(59.1% .293 322.896);--colors-fuchsia-700: oklch(51.8% .253 323.949);--colors-fuchsia-800: oklch(45.2% .211 324.591);--colors-fuchsia-900: oklch(40.1% .17 325.612);--colors-fuchsia-950: oklch(29.3% .136 325.661);--colors-fuchsia-DEFAULT: oklch(74% .238 322.16);--colors-pink-50: oklch(97.1% .014 343.198);--colors-pink-100: oklch(94.8% .028 342.258);--colors-pink-200: oklch(89.9% .061 343.231);--colors-pink-300: oklch(82.3% .12 346.018);--colors-pink-400: oklch(71.8% .202 349.761);--colors-pink-500: oklch(65.6% .241 354.308);--colors-pink-600: oklch(59.2% .249 .584);--colors-pink-700: oklch(52.5% .223 3.958);--colors-pink-800: oklch(45.9% .187 3.815);--colors-pink-900: oklch(40.8% .153 2.432);--colors-pink-950: oklch(28.4% .109 3.907);--colors-pink-DEFAULT: oklch(71.8% .202 349.761);--colors-rose-50: oklch(96.9% .015 12.422);--colors-rose-100: oklch(94.1% .03 12.58);--colors-rose-200: oklch(89.2% .058 10.001);--colors-rose-300: oklch(81% .117 11.638);--colors-rose-400: oklch(71.2% .194 13.428);--colors-rose-500: oklch(64.5% .246 16.439);--colors-rose-600: oklch(58.6% .253 17.585);--colors-rose-700: oklch(51.4% .222 16.935);--colors-rose-800: oklch(45.5% .188 13.697);--colors-rose-900: oklch(41% .159 10.272);--colors-rose-950: oklch(27.1% .105 12.094);--colors-rose-DEFAULT: oklch(71.2% .194 13.428);--colors-light-50: oklch(99.4% 0 0);--colors-light-100: oklch(99.11% 0 0);--colors-light-200: oklch(98.51% 0 0);--colors-light-300: oklch(98.16% .0017 247.84);--colors-light-400: oklch(97.31% 0 0);--colors-light-500: oklch(96.12% 0 0);--colors-light-600: oklch(96.32% .0034 247.86);--colors-light-700: oklch(94.17% .0052 247.88);--colors-light-800: oklch(91.09% .007 247.9);--colors-light-900: oklch(90.72% .0051 228.82);--colors-light-950: oklch(89.23% .006 239.83);--colors-light-DEFAULT: oklch(97.31% 0 0);--colors-dark-50: oklch(40.91% 0 0);--colors-dark-100: oklch(35.62% 0 0);--colors-dark-200: oklch(31.71% 0 0);--colors-dark-300: oklch(29.72% 0 0);--colors-dark-400: oklch(25.2% 0 0);--colors-dark-500: oklch(23.93% 0 0);--colors-dark-600: oklch(22.73% .0038 286.09);--colors-dark-700: oklch(22.21% 0 0);--colors-dark-800: oklch(20.9% 0 0);--colors-dark-900: oklch(16.84% 0 0);--colors-dark-950: oklch(13.44% 0 0);--colors-dark-DEFAULT: oklch(25.2% 0 0);--colors-primary-50: hsl(198, 100%, 97%);--colors-primary-100: hsl(198, 100%, 92%);--colors-primary-200: hsl(198, 100%, 84%);--colors-primary-300: hsl(198, 100%, 75%);--colors-primary-400: hsl(198, 100%, 66%);--colors-primary-500: hsl(198, 100%, 55%);--colors-primary-600: hsl(198, 100%, 45%);--colors-primary-700: hsl(198, 100%, 35%);--colors-primary-800: hsl(198, 100%, 24%);--colors-primary-900: hsl(198, 100%, 15%);--colors-primary-DEFAULT: hsl(198, 100%, 55%);--colors-secondary-50: hsl(120, 100%, 97%);--colors-secondary-100: hsl(120, 100%, 92%);--colors-secondary-200: hsl(120, 100%, 84%);--colors-secondary-300: hsl(120, 100%, 75%);--colors-secondary-400: hsl(120, 100%, 66%);--colors-secondary-500: hsl(120, 100%, 55%);--colors-secondary-600: hsl(120, 100%, 45%);--colors-secondary-700: hsl(120, 100%, 35%);--colors-secondary-800: hsl(120, 100%, 24%);--colors-secondary-900: hsl(120, 100%, 15%);--colors-secondary-DEFAULT: hsl(120, 100%, 55%);--colors-tertiary-50: hsl(175, 100%, 97%);--colors-tertiary-100: hsl(175, 100%, 92%);--colors-tertiary-200: hsl(175, 100%, 84%);--colors-tertiary-300: hsl(175, 100%, 75%);--colors-tertiary-400: hsl(175, 100%, 66%);--colors-tertiary-500: hsl(175, 100%, 55%);--colors-tertiary-600: hsl(175, 100%, 45%);--colors-tertiary-700: hsl(175, 100%, 35%);--colors-tertiary-800: hsl(175, 100%, 24%);--colors-tertiary-900: hsl(175, 100%, 15%);--colors-tertiary-DEFAULT: hsl(175, 100%, 55%);--colors-success-50: hsl(149, 87%, 97%);--colors-success-100: hsl(149, 87%, 92%);--colors-success-200: hsl(149, 87%, 84%);--colors-success-300: hsl(149, 87%, 75%);--colors-success-400: hsl(149, 87%, 66%);--colors-success-500: hsl(149, 87%, 55%);--colors-success-600: hsl(149, 87%, 45%);--colors-success-700: hsl(149, 87%, 35%);--colors-success-800: hsl(149, 87%, 24%);--colors-success-900: hsl(149, 87%, 15%);--colors-success-DEFAULT: hsl(149, 87%, 55%);--colors-warning-50: hsl(32, 100%, 97%);--colors-warning-100: hsl(32, 100%, 92%);--colors-warning-200: hsl(32, 100%, 84%);--colors-warning-300: hsl(32, 100%, 75%);--colors-warning-400: hsl(32, 100%, 66%);--colors-warning-500: hsl(32, 100%, 55%);--colors-warning-600: hsl(32, 100%, 45%);--colors-warning-700: hsl(32, 100%, 35%);--colors-warning-800: hsl(32, 100%, 24%);--colors-warning-900: hsl(32, 100%, 15%);--colors-warning-DEFAULT: hsl(32, 100%, 55%);--colors-danger-50: hsl(345, 100%, 97%);--colors-danger-100: hsl(345, 100%, 92%);--colors-danger-200: hsl(345, 100%, 84%);--colors-danger-300: hsl(345, 100%, 75%);--colors-danger-400: hsl(345, 100%, 66%);--colors-danger-500: hsl(345, 100%, 55%);--colors-danger-600: hsl(345, 100%, 45%);--colors-danger-700: hsl(345, 100%, 35%);--colors-danger-800: hsl(345, 100%, 24%);--colors-danger-900: hsl(345, 100%, 15%);--colors-danger-DEFAULT: hsl(345, 100%, 55%);--colors-default-50: hsl(0, 0%, 97%);--colors-default-100: hsl(0, 0%, 92%);--colors-default-200: hsl(0, 0%, 84%);--colors-default-300: hsl(0, 0%, 75%);--colors-default-400: hsl(0, 0%, 66%);--colors-default-500: hsl(0, 0%, 55%);--colors-default-600: hsl(0, 0%, 45%);--colors-default-700: hsl(0, 0%, 35%);--colors-default-800: hsl(0, 0%, 24%);--colors-default-900: hsl(0, 0%, 15%);--colors-default-DEFAULT: hsl(0, 0%, 35%);--colors-surface-50: hsl(0, 0%, 97%);--colors-surface-100: hsl(0, 0%, 92%);--colors-surface-200: hsl(0, 0%, 84%);--colors-surface-300: hsl(0, 0%, 75%);--colors-surface-400: hsl(0, 0%, 66%);--colors-surface-500: hsl(0, 0%, 55%);--colors-surface-600: hsl(0, 0%, 45%);--colors-surface-700: hsl(0, 0%, 35%);--colors-surface-800: hsl(0, 0%, 24%);--colors-surface-900: hsl(0, 0%, 15%);--colors-surface-DEFAULT: hsl(0, 0%, 35%);--text-xs-fontSize: .75rem;--text-xs-lineHeight: 1rem;--text-sm-fontSize: .875rem;--text-sm-lineHeight: 1.25rem;--text-base-fontSize: 1rem;--text-base-lineHeight: 1.5rem;--text-lg-fontSize: 1.125rem;--text-lg-lineHeight: 1.75rem;--text-xl-fontSize: 1.25rem;--text-xl-lineHeight: 1.75rem;--text-2xl-fontSize: 1.5rem;--text-2xl-lineHeight: 2rem;--text-3xl-fontSize: 1.875rem;--text-3xl-lineHeight: 2.25rem;--text-4xl-fontSize: 2.25rem;--text-4xl-lineHeight: 2.5rem;--text-5xl-fontSize: 3rem;--text-5xl-lineHeight: 1;--text-6xl-fontSize: 3.75rem;--text-6xl-lineHeight: 1;--text-7xl-fontSize: 4.5rem;--text-7xl-lineHeight: 1;--text-8xl-fontSize: 6rem;--text-8xl-lineHeight: 1;--text-9xl-fontSize: 8rem;--text-9xl-lineHeight: 1;--text-color: var(--color-surface-100);--fontWeight-thin: 100;--fontWeight-extralight: 200;--fontWeight-light: 300;--fontWeight-normal: 400;--fontWeight-medium: 500;--fontWeight-semibold: 600;--fontWeight-bold: 700;--fontWeight-extrabold: 800;--fontWeight-black: 900;--tracking-tighter: -.05em;--tracking-tight: -.025em;--tracking-normal: 0em;--tracking-wide: .025em;--tracking-wider: .05em;--tracking-widest: .1em;--leading-none: 1;--leading-tight: 1.25;--leading-snug: 1.375;--leading-normal: 1.5;--leading-relaxed: 1.625;--leading-loose: 2;--textStrokeWidth-DEFAULT: 1.5rem;--textStrokeWidth-none: 0;--textStrokeWidth-sm: thin;--textStrokeWidth-md: medium;--textStrokeWidth-lg: thick;--radius-DEFAULT: .25rem;--radius-none: 0;--radius-xs: .125rem;--radius-sm: .25rem;--radius-md: .375rem;--radius-lg: .5rem;--radius-xl: .75rem;--radius-2xl: 1rem;--radius-3xl: 1.5rem;--radius-4xl: 2rem;--ease-linear: linear;--ease-in: cubic-bezier(.4, 0, 1, 1);--ease-out: cubic-bezier(0, 0, .2, 1);--ease-in-out: cubic-bezier(.4, 0, .2, 1);--ease-DEFAULT: cubic-bezier(.4, 0, .2, 1);--blur-DEFAULT: 8px;--blur-xs: 4px;--blur-sm: 8px;--blur-md: 12px;--blur-lg: 16px;--blur-xl: 24px;--blur-2xl: 40px;--blur-3xl: 64px;--perspective-dramatic: 100px;--perspective-near: 300px;--perspective-normal: 500px;--perspective-midrange: 800px;--perspective-distant: 1200px;--default-transition-duration: .15s;--default-transition-timingFunction: cubic-bezier(.4, 0, .2, 1);--default-font-family: var(--font-sans);--default-font-featureSettings: var(--font-sans--font-feature-settings);--default-font-variationSettings: var(--font-sans--font-variation-settings);--default-monoFont-family: var(--font-mono);--default-monoFont-featureSettings: var(--font-mono--font-feature-settings);--default-monoFont-variationSettings: var(--font-mono--font-variation-settings);--container-3xs: 16rem;--container-2xs: 18rem;--container-xs: 20rem;--container-sm: 24rem;--container-md: 28rem;--container-lg: 32rem;--container-xl: 36rem;--container-2xl: 42rem;--container-3xl: 48rem;--container-4xl: 56rem;--container-5xl: 64rem;--container-6xl: 72rem;--container-7xl: 80rem;--container-prose: 65ch;--background-color: var(--colors-primary-100);--boxShadow-md: 0 4px 6px -1px rgb(0 0 0 / .1), 0 2px 4px -2px rgb(0 0 0 / .1);--boxShadow-lg: 0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1);--theme-background-color: #e7e5e4;--theme-font-family: "Manrope"}*,:after,:before,::backdrop,::file-selector-button{box-sizing:border-box;margin:0;padding:0;border:0 solid}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;tab-size:4;font-family:var( --default-font-family, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" );font-feature-settings:var(--default-font-featureSettings, normal);font-variation-settings:var(--default-font-variationSettings, normal);-webkit-tap-highlight-color:transparent}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;-webkit-text-decoration:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:var( --default-monoFont-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace );font-feature-settings:var(--default-monoFont-featureSettings, normal);font-variation-settings:var(--default-monoFont-variationSettings, normal);font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}:-moz-focusring{outline:auto}progress{vertical-align:baseline}summary{display:list-item}ol,ul,menu{list-style:none}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}button,input,select,optgroup,textarea,::file-selector-button{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;border-radius:0;background-color:transparent;opacity:1}:where(select:is([multiple],[size])) optgroup{font-weight:bolder}:where(select:is([multiple],[size])) optgroup option{padding-inline-start:20px}::file-selector-button{margin-inline-end:4px}::placeholder{opacity:1}@supports (not (-webkit-appearance: -apple-pay-button)) or (contain-intrinsic-size: 1px){::placeholder{color:color-mix(in oklab,currentcolor 50%,transparent)}}textarea{resize:vertical}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-date-and-time-value{min-height:1lh;text-align:inherit}::-webkit-datetime-edit{display:inline-flex}::-webkit-datetime-edit-fields-wrapper{padding:0}::-webkit-datetime-edit,::-webkit-datetime-edit-year-field,::-webkit-datetime-edit-month-field,::-webkit-datetime-edit-day-field,::-webkit-datetime-edit-hour-field,::-webkit-datetime-edit-minute-field,::-webkit-datetime-edit-second-field,::-webkit-datetime-edit-millisecond-field,::-webkit-datetime-edit-meridiem-field{padding-block:0}:-moz-ui-invalid{box-shadow:none}button,input:where([type=button],[type=reset],[type=submit]),::file-selector-button{appearance:button}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[hidden]:where(:not([hidden=until-found])){display:none!important}.text-2xl{font-size:var(--text-2xl-fontSize);line-height:var(--un-leading, var(--text-2xl-lineHeight))}.text-4xl{font-size:var(--text-4xl-fontSize);line-height:var(--un-leading, var(--text-4xl-lineHeight))}.text-sm{font-size:var(--text-sm-fontSize);line-height:var(--un-leading, var(--text-sm-lineHeight))}.text-xs{font-size:var(--text-xs-fontSize);line-height:var(--un-leading, var(--text-xs-lineHeight))}.text-gray-500{color:color-mix(in srgb,var(--colors-gray-500) var(--un-text-opacity),transparent)}.text-gray-700{color:color-mix(in srgb,var(--colors-gray-700) var(--un-text-opacity),transparent)}.text-gray-800{color:color-mix(in srgb,var(--colors-gray-800) var(--un-text-opacity),transparent)}.text-gray-900{color:color-mix(in srgb,var(--colors-gray-900) var(--un-text-opacity),transparent)}.text-yellow-800{color:color-mix(in srgb,var(--colors-yellow-800) var(--un-text-opacity),transparent)}.font-bold{--un-font-weight:var(--fontWeight-bold);font-weight:var(--fontWeight-bold)}.font-extrabold{--un-font-weight:var(--fontWeight-extrabold);font-weight:var(--fontWeight-extrabold)}.font-mono{font-family:var(--font-mono)}.font-semibold{--un-font-weight:var(--fontWeight-semibold);font-weight:var(--fontWeight-semibold)}.p-2{padding:calc(var(--spacing) * 2)}.p-4{padding:calc(var(--spacing) * 4)}.p-6{padding:calc(var(--spacing) * 6)}.px-2{padding-inline:calc(var(--spacing) * 2)}.py-1{padding-block:calc(var(--spacing) * 1)}.pb-2{padding-bottom:calc(var(--spacing) * 2)}.text-center{text-align:center}.text-right{text-align:right}.border{border-width:1px}.border-b{border-bottom-width:1px}.rounded{border-radius:var(--radius-DEFAULT)}.rounded-lg{border-radius:var(--radius-lg)}.rounded-md{border-radius:var(--radius-md)}.bg-gray-100{background-color:color-mix(in srgb,var(--colors-gray-100) var(--un-bg-opacity),transparent)}.bg-gray-200{background-color:color-mix(in srgb,var(--colors-gray-200) var(--un-bg-opacity),transparent)}.bg-gray-50{background-color:color-mix(in srgb,var(--colors-gray-50) var(--un-bg-opacity),transparent)}.bg-white{background-color:color-mix(in srgb,var(--colors-white) var(--un-bg-opacity),transparent)}.bg-yellow-100{background-color:color-mix(in srgb,var(--colors-yellow-100) var(--un-bg-opacity),transparent)}.flex{display:flex}.flex-1{flex:1 1 0%}.flex-shrink-0{flex-shrink:0}.flex-grow{flex-grow:1}.flex-col{flex-direction:column}.gap-2{gap:calc(var(--spacing) * 2)}.gap-3{gap:calc(var(--spacing) * 3)}.gap-4{gap:calc(var(--spacing) * 4)}.gap-6{gap:calc(var(--spacing) * 6)}.grid{display:grid}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.h-full{height:100%}.min-h-screen{min-height:100vh}.w-full{width:100%}.shadow-md{--un-shadow:0 4px 6px -1px var(--un-shadow-color, rgb(0 0 0 / .1)),0 2px 4px -2px var(--un-shadow-color, rgb(0 0 0 / .1));box-shadow:var(--un-inset-shadow),var(--un-inset-ring-shadow),var(--un-ring-offset-shadow),var(--un-ring-shadow),var(--un-shadow)}.items-center{align-items:center}.justify-end{justify-content:flex-end}.justify-between{justify-content:space-between}@supports (color: color-mix(in lab,red,red)){.text-gray-500{color:color-mix(in oklab,var(--colors-gray-500) var(--un-text-opacity),transparent)}.text-gray-700{color:color-mix(in oklab,var(--colors-gray-700) var(--un-text-opacity),transparent)}.text-gray-800{color:color-mix(in oklab,var(--colors-gray-800) var(--un-text-opacity),transparent)}.text-gray-900{color:color-mix(in oklab,var(--colors-gray-900) var(--un-text-opacity),transparent)}.text-yellow-800{color:color-mix(in oklab,var(--colors-yellow-800) var(--un-text-opacity),transparent)}.bg-gray-100{background-color:color-mix(in oklab,var(--colors-gray-100) var(--un-bg-opacity),transparent)}.bg-gray-200{background-color:color-mix(in oklab,var(--colors-gray-200) var(--un-bg-opacity),transparent)}.bg-gray-50{background-color:color-mix(in oklab,var(--colors-gray-50) var(--un-bg-opacity),transparent)}.bg-white{background-color:color-mix(in oklab,var(--colors-white) var(--un-bg-opacity),transparent)}.bg-yellow-100{background-color:color-mix(in oklab,var(--colors-yellow-100) var(--un-bg-opacity),transparent)}}@media (min-width: 48rem){.md\\:col-span-2{grid-column:span 2/span 2}.md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (min-width: 64rem){.lg\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}}body{font-family:var(--font-family)}html,body{font-family:var(--theme-font-family);background-color:var(--theme-background-color)!important;color:var(--text-color)!important;width:100%;min-height:100%;height:100%;padding:0;margin:0}body:not(.production) *:not(:defined){border:1px solid red}.dark{filter:invert(1) hue-rotate(180deg)}.dark img,.dark dialog,.dark video,.dark iframe{filter:invert(1) hue-rotate(180deg)}html{font-size:14px}@media (max-width: 768px){html{font-size:18px}}@media (max-width: 480px){html{font-size:20px}}textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}:root{box-sizing:border-box;-moz-text-size-adjust:none;-webkit-text-size-adjust:none;text-size-adjust:none;line-height:1.2;-webkit-font-smoothing:antialiased}*,*:before,*:after{box-sizing:border-box}*{margin:0}body{-webkit-font-smoothing:antialiased;font-family:var(--font-family)}button,textarea,select{background-color:inherit;border-width:0;color:inherit}img,picture,video,canvas,svg{display:block;max-width:100%}input,button,textarea,select{font:inherit}p,h1,h2,h3,h4,h5,h6{font-family:var(--font-family);overflow-wrap:break-word}dialog::backdrop{background-color:#000c}*::-webkit-scrollbar{width:8px;margin-right:10px}*::-webkit-scrollbar-track{background:transparent}*::-webkit-scrollbar-thumb{&:hover{scrollbar-color:rgba(154,153,150,.8) transparent}border-radius:10px;border:none}*::-webkit-scrollbar-button{background:transparent;color:transparent}*{scrollbar-width:thin;scrollbar-color:transparent transparent;&:hover{scrollbar-color:rgba(154,153,150,.8) transparent}}[full]{width:100%;height:100vh}[w-full]{width:100%}[grow]{flex-grow:1}[hide],.hide{display:none!important}[noscroll]{overflow:hidden}div [container]{display:flex}div [container][horizontal]{display:flex;flex-direction:col}.uix-list{display:flex;&[vertical]{flex-direction:column}}.uix-navbar{--uix-navbar-text-color: var(--color-default-90);--uix-navbar-hover-text-color: var(--color-surface-80);--uix-navbar-border-radius: 0px;--uix-navbar-border-color: var(--color-default-60);--uix-navbar-border-size: 1px;--uix-navbar-border-style: solid;--uix-navbar-hover-background-color: var(--color-default-40);--uix-container-position: var(--uix-navbar-position);display:flex;flex-direction:column;&[docked]{--uix-list-button-radius: 0;border-bottom:0;position:fixed;bottom:0;background-color:var(--uix-navbar-background-color, var(--color-default-5));>*{border-right:0;border-bottom:0;&:first-child{border-left:0}}}}:where(.uix-link){font-weight:var(--uix-link-font-weight, 600);width:var(--uix-link-width, auto);color:var(--uix-link-text-color, var(--colors-default-900));--uix-link-indent: 0;cursor:pointer;&[vertical]{margin:0 auto}a,button{width:inherit;cursor:pointer;padding:var(--uix-link-padding);&:hover{color:var(--uix-link-hover-color, var(--uix-link-text-color))}}.uix-text-icon__element{display:flex;align-items:center;gap:var(--uix-link-icon-gap, .5rem);&[reverse][vertical]{flex-direction:column-reverse}&:not([reverse])[vertical]{flex-direction:column}&[reverse]:not([vertical]){flex-direction:row-reverse}&:not([reverse]):not([vertical]){flex-direction:row}}transition:all .3s ease-in-out;&[indent]{>a,>button{padding-left:var(--uix-link-indent)}}&[active]:hover{color:var(--uix-link-hover-text-color, var(--colors-primary-400))}&[selectable][selected]{background-color:var(--colors-primary-400)}&:hover{[tooltip]{display:flex}}&[tooltip]{display:inline-block;&:hover{[tooltip]{visibility:visible}}[tooltip]{visibility:hidden;width:120px;background-color:#000;color:#fff;text-align:center;border-radius:6px;padding:5px 10px;margin-left:3px;position:absolute;z-index:1000000000;top:50%;left:100%;transform:translateY(-50%)}}&[position~=top] [tooltip]{bottom:100%;left:50%;transform:translate(-50%)}&[position~=bottom] [tooltip]{top:100%;left:50%;transform:translate(-50%)}&[position~=left] [tooltip]{top:50%;right:100%;transform:translateY(-50%)}&[tooltip],&[dropdown],&[context],&[float]{position:relative}&[dropdown],&[accordion]{flex-direction:column}[float],[dropdown],[accordion],[context]{display:none}&[floatopen]>a{display:none}&[floatopen] [float]{display:block;position:relative;bottom:0;right:0}&[context]{z-index:auto}[context][open]{display:flex;flex-direction:column}[dropdown],[context][open]{position:absolute;left:0;top:100%;width:100%;min-width:200px;z-index:1000;background-color:var(--colors-primary-100);box-shadow:0 8px 16px #0003;.uix-link:hover,input{background-color:var(--colors-primary-200)}>.uix-link{width:100%}}[context][open]{display:flex}&[selected]{[dropdown],[accordion]{display:flex;flex-direction:column}}}:where(.uix-button){border:var(--uix-button-borderSize, 0) solid var(--uix-button-borderColor);border-radius:var(--uix-button-borderRadius, var(--radius-md));box-shadow:var(--uix-button-shadow);width:var(--uix-button-width);min-width:fit-content;background-color:var(--uix-button-backgroundColor, black);color:var(--uix-button-textColor, var(--colors-default-100));font-weight:var(--uix-button-fontWeight, 700);display:flex;text-align:center;transition:transform .2s ease-in-out,opacity .2s ease-in-out,background-color .2s ease-in-out;&:hover{opacity:var(--uix-button-hover-opacity, .4)}&:active{transform:scale(.97)}>button,>a,>input{width:max-content;display:block;border-radius:inherit;cursor:var(--uix-button-cursor, pointer);height:calc(var(--spacing) * 10);line-height:calc(var(--spacing) * 5);padding:var( --uix-button-padding, calc(var(--spacing) * 2.5) calc(var(--spacing) * 4) );word-break:keep-all;flex-basis:100%}.uix-icon,button,input,a{cursor:pointer}&[bordered]{--uix-button-border-size: 1px;--uix-button-backgroundColor: transparent;--uix-button-hoverBackgroundColor: var(--_variant-color-300);--uix-button-borderColor: var(--_variant-color-400);--uix-button-textColor: var(--_variant-color-700)}&[ghost]{--uix-button-backgroundColor: transparent;--uix-button-hoverBackgroundColor: var(--_variant-color-300);--uix-button-borderSize: 0px;--uix-button-textColor: var(--_variant-color-700)}&[outline]{--uix-button-backgroundColor: transparent;--uix-button-hoverBackgroundColor: var(--_variant-color-300);--uix-button-textColor: var(--_variant-color-800);--uix-button-borderSize: 1px;--uix-button-borderColor: var(--_variant-color-400)}&[float]{background-color:#000;--uix-button-hoverBackgroundColor: var(--_variant-color-500);--uix-button-textColor: var(--_variant-color-50);--uix-button-borderSize: 0px;--uix-button-borderRadius: 9999px;--uix-button-width: var(--uix-button-height);box-shadow:var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / .1));--uix-button-padding: .5rem}&[float]:hover{box-shadow:var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / .1))}}.uix-icon{display:inline-block;vertical-align:middle;svg{height:inherit;width:inherit}}&[solid]{stroke:currentColor;fill:currentColor}:where(.uix-input){--uix-input-background-color: var(--colors-surface-100);--uix-input-border-color: var(--colors-gray-900);--uix-input-text-color: var(--colors-gray-900);--uix-input-placeholder-color: var(--colors-default-500);--uix-input-border-radius: var(--border-radius-md);--uix-input-border-width: 2px;--uix-input-padding-x: calc(var(--spacing) * 4);--uix-input-padding-y: calc(var(--spacing) * 2.5);--uix-input-font-size: var(--font-size-base);--uix-input-height: 2.5rem;--uix-input-disabled-opacity: .6;--uix-input-label-font-size: var(--font-size-sm);--uix-input-label-font-weight: var(--font-weight-bold);--uix-input-label-color: var(--colors-default-700);--uix-input-checkbox-size: 1.5rem;--uix-input-checkbox-border-radius: var(--border-radius-sm);--uix-input-checkbox-checked-bg: var(--colors-primary-600);--uix-input-checkbox-check-color: var(--colors-surface-100);width:100%;display:flex;flex-direction:column;input,select,textarea{width:100%;height:var(--uix-input-height);border-radius:var(--uix-input-border-radius);border:var(--uix-input-border-width) solid var(--uix-input-border-color);font-size:var(--uix-input-font-size);background-color:var(--uix-input-background-color);color:var(--uix-input-text-color);transition:var(--uix-transition);outline:none;padding:var(--uix-input-padding-y) var(--uix-input-padding-x)}textarea{resize:vertical}&:has(textarea){height:auto}select{appearance:none;-webkit-appearance:none;cursor:pointer;font-weight:600;padding-block:0;option{font-weight:600;background-color:var(--uix-input-background-color);font-size:1.1rem;line-height:1.5rem;color:#333;padding:50px;border:2px solid red}}.select-container{position:relative;.select-arrow{position:absolute;right:calc(2 * var(--spacing))}}input::placeholder{color:transparent}label{font-weight:var(--uix-input-label-font-weight);color:var(--uix-input-label-color, var(--colors-gray-600));margin-bottom:var(--spacing);font-size:.9rem;padding:0 4px;transition:all .2s ease-in-out;pointer-events:none;&[required]:after{content:"*";color:var(--colors-danger-500);margin-left:2px}}input:not(:placeholder-shown)+label,textarea:not(:placeholder-shown)+label,&:focus-within label,&.has-value label{top:-2px;transform:translateY(0);font-size:var(--uix-input-label-font-size)}&:focus-within input,&:focus-within select,&:focus-within textarea{box-shadow:0 0 var(--uix-input-focus-ring-width, 5px) var(--uix-input-focus-ring-color, rgba(0, 0, 255, .5))}&[disabled]{cursor:not-allowed;opacity:var(--uix-input-disabled-opacity);& label{cursor:not-allowed}}.input-icon,.select-arrow{position:absolute;top:50%;right:var(--spacing);transform:translateY(-50%);pointer-events:none;color:var(--uix-input-label-color);transition:transform .2s ease-in-out}&:has(select:hover:active) .select-arrow{transform:translateY(-50%) rotate(180deg)}&:has(.input-icon:not(.select-arrow))>input{padding-right:calc(var(--uix-input-padding-x) + 1.75em)}&[type=checkbox],&[type=radio]{flex-direction:row;align-items:center;border:0;height:auto;width:auto;background-color:transparent;box-shadow:none;gap:.75rem;cursor:pointer;label{margin:0;line-height:1.5rem;position:static;transform:none;background-color:transparent;padding:0;cursor:pointer;font-weight:var(--font-weight-normal);order:2;pointer-events:auto}input{appearance:none;-webkit-appearance:none;width:var(--uix-input-checkbox-size);height:var(--uix-input-checkbox-size);margin:0;border:var(--uix-input-border-width) solid var(--uix-input-border-color);background-color:var(--uix-input-background-color);cursor:pointer;position:relative;transition:var(--uix-transition);padding:0;&:after{content:"";position:absolute;display:none;left:50%;top:50%}&:checked{background-color:var(--uix-input-checkbox-checked-bg);border-color:var(--uix-input-checkbox-checked-bg);&:after{display:block}}&:focus-visible{box-shadow:0 0 0 var(--uix-input-focus-ring-width) var(--uix-input-focus-ring-color);border-color:var(--uix-input-focus-ring-color)}}}&[type=checkbox] input:after{width:.375rem;height:.75rem;border:solid var(--uix-input-checkbox-check-color);border-width:0 2px 2px 0;transform:translate(-50%,-60%) rotate(45deg)}&[type=radio] input{border-radius:var(--border-radius-full);&:after{width:calc(var(--uix-input-checkbox-size) / 2);height:calc(var(--uix-input-checkbox-size) / 2);border-radius:var(--border-radius-full);background-color:var(--uix-input-checkbox-check-color);transform:translate(-50%,-50%)}}&[ghost]{&:focus-within select{box-shadow:none}.select-arrow{margin-left:5px;padding-left:5px}select{background:inherit;border:0}}}
`,metaType:"text/css"}};self.addEventListener("install",t=>t.waitUntil(self.skipWaiting())),self.addEventListener("activate",t=>t.waitUntil(self.clients.claim())),self.addEventListener("fetch",t=>{const n=new URL(t.request.url),e=FILE_BUNDLE[n.pathname];e&&t.respondWith(new Response(e.content,{headers:{"Content-Type":e.metaType||"application/javascript"}}))});
