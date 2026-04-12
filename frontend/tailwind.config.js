/**
 * EduAdmin — tailwind.config.js
 * Design System: Modern Editorial × Humanist
 *
 * PHONG CÁCH: Tạp chí hiện đại pha chất Humanist — ấm áp, rõ chữ, có hồn.
 * Không dùng màu xanh/tím sặc sỡ làm tone chủ đạo.
 * Ink-on-paper: nền kem nhẹ, chữ warm-black, accent đất nung.
 *
 * DARK MODE: class strategy — thêm class "dark" lên <html>
 *
 * FONT STACK (phải import trong globals.css):
 *   Lora        → serif, display & heading
 *   Plus Jakarta Sans → sans, body & UI
 *   JetBrains Mono    → mono, code & data
 *
 * @type {import('tailwindcss').Config}
 */

module.exports = {
	content: [
		"./src/**/*.{js,ts,jsx,tsx,html}",
		"./app/**/*.{js,ts,jsx,tsx}",
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
	],

	darkMode: "class",

	theme: {
		// ─────────────────────────────────────────────────────────
		// OVERRIDE toàn bộ screens (bỏ default của Tailwind)
		// ─────────────────────────────────────────────────────────
		screens: {
			xs: "480px",
			sm: "640px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
			"2xl": "1440px",
		},

		extend: {

			// ───────────────────────────────────────────────────────
			// COLORS
			// Quy ước đặt tên: {semantic}-{role}
			//   paper     → nền trang (kem nhẹ)
			//   ink       → chữ (warm-black scale)
			//   surface   → card / panel background
			//   warm      → accent chính (đất nung / terracotta)
			//   ink-blue  → semantic info (xanh navy học thuật)
			//   ink-green → semantic success
			//   ink-amber → semantic warning
			//   ink-red   → semantic danger
			//   ink-sage  → semantic special / xuất sắc
			//   sidebar   → sidebar dark shell
			// ───────────────────────────────────────────────────────
			colors: {

				// ── Paper (nền) ──────────────────────────────────────
				paper: {
					DEFAULT: "#FAFAF8",  // nền trang chính
					dark: "#141210",  // dark mode tương đương
				},

				// ── Surface (cards, panels) ──────────────────────────
				surface: {
					DEFAULT: "#FFFFFF",  // card / panel chính
					2: "#F5F4F1",  // hover row, thead bg
					3: "#EDEBE6",  // sunken / disabled bg
					"dark-1": "#1E1B18",  // card dark
					"dark-2": "#252220",  // hover row dark
					"dark-3": "#2E2A27",  // sunken dark
				},

				// ── Ink (chữ) ────────────────────────────────────────
				ink: {
					1: "#1C1917",  // primary text — warm black (không lạnh)
					2: "#57534E",  // secondary text
					3: "#A8A29E",  // tertiary / placeholder
					4: "#D6D3D1",  // disabled / decorative
					// dark equivalents
					"d1": "#F5F4F1",
					"d2": "#A8A29E",
					"d3": "#57534E",
					"d4": "#2C2927",
				},

				// ── Rule (border) ────────────────────────────────────
				// Dùng qua CSS var để có alpha channel — xem globals.css
				rule: {
					DEFAULT: "rgba(0,0,0,0.08)",
					md: "rgba(0,0,0,0.13)",
					dark: "rgba(255,255,255,0.07)",
					"dark-md": "rgba(255,255,255,0.12)",
				},

				// ── Warm accent — MÀUaccent chính của EduAdmin ───────
				warm: {
					50: "#FBF0EC",
					100: "#F4C8B4",
					200: "#E8A07C",
					400: "#C2714F",  // DEFAULT accent (đất nung)
					600: "#A85A38",  // hover state
					800: "#6B3520",
					900: "#3D1E10",
					fill: "#FBF0EC",  // pill / badge background
					text: "#A85A38",  // pill / badge text
					border: "#F4C8B4", // pill / badge border
					// dark
					"dark-fill": "#2E1A10",
					"dark-text": "#D4845A",
					"dark-border": "#4E2A18",
				},

				// ── Ink-blue — info / primary action ─────────────────
				"ink-blue": {
					fill: "#EEF4FE",
					text: "#1E4FA8",
					border: "#C5D8F8",
					"dark-fill": "#1A2845",
					"dark-text": "#93C5FD",
					"dark-border": "#1E3A6E",
				},

				// ── Ink-green — success ───────────────────────────────
				"ink-green": {
					fill: "#EDFAF3",
					text: "#166534",
					border: "#BBF0D6",
					"dark-fill": "#0F2A1A",
					"dark-text": "#6EE7B7",
					"dark-border": "#134E2A",
				},

				// ── Ink-amber — warning ───────────────────────────────
				"ink-amber": {
					fill: "#FFFBEB",
					text: "#92400E",
					border: "#FDE68A",
					"dark-fill": "#271D08",
					"dark-text": "#FCD34D",
					"dark-border": "#4A3208",
				},

				// ── Ink-red — danger ──────────────────────────────────
				"ink-red": {
					fill: "#FEF2F2",
					text: "#991B1B",
					border: "#FECACA",
					"dark-fill": "#2A1010",
					"dark-text": "#FCA5A5",
					"dark-border": "#4A1A1A",
				},

				// ── Ink-sage — xuất sắc / special ────────────────────
				"ink-sage": {
					fill: "#F0F4EE",
					text: "#3A5C36",
					border: "#C5DCC0",
					"dark-fill": "#162010",
					"dark-text": "#A7D9A2",
					"dark-border": "#1E3A18",
				},

				// ── Sidebar ───────────────────────────────────────────
				sidebar: {
					bg: "#1C1917",  // light mode sidebar vẫn dark
					text: "#A8A29E",
					"text-active": "#FAF9F7",
					active: "rgba(255,255,255,0.07)",
					border: "rgba(255,255,255,0.06)",
					accent: "#C2714F",  // warm accent trên nền tối
					"dark-bg": "#0E0C0A",
					"dark-text": "#57534E",
					"dark-accent": "#D4845A",
				},
			},

			// ───────────────────────────────────────────────────────
			// TYPOGRAPHY
			// ───────────────────────────────────────────────────────
			fontFamily: {
				serif: ["'Lora'", "Georgia", "serif"],
				sans: ["'Plus Jakarta Sans'", "'Helvetica Neue'", "sans-serif"],
				mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
				display: ["'Lora'", "Georgia", "serif"], // alias rõ nghĩa hơn cho heading lớn
			},

			fontSize: {
				// format: [size, { lineHeight, letterSpacing? }]
				"2xs": ["0.6rem", { lineHeight: "1rem" }],
				xs: ["0.72rem", { lineHeight: "1.1rem" }],
				sm: ["0.82rem", { lineHeight: "1.35rem" }],
				base: ["0.875rem", { lineHeight: "1.65rem" }],   // 14px
				md: ["0.9375rem", { lineHeight: "1.6rem" }],    // 15px
				lg: ["1rem", { lineHeight: "1.5rem" }],    // 16px
				xl: ["1.125rem", { lineHeight: "1.4rem" }],    // 18px
				"2xl": ["1.25rem", { lineHeight: "1.3rem" }],    // 20px
				"3xl": ["1.5rem", { lineHeight: "1.25rem" }],   // 24px
				"4xl": ["1.75rem", { lineHeight: "1.2rem" }],    // 28px
				"5xl": ["2rem", { lineHeight: "1.15rem" }],   // 32px
				"display-sm": ["1.5rem", { lineHeight: "1.2rem", letterSpacing: "-0.03em" }],
				"display-md": ["1.75rem", { lineHeight: "1.15rem", letterSpacing: "-0.035em" }],
				"display-lg": ["2rem", { lineHeight: "1.1rem", letterSpacing: "-0.04em" }],
			},

			fontWeight: {
				light: "300",
				regular: "400",
				medium: "500",
				semibold: "600",
				bold: "700",
			},

			lineHeight: {
				tightest: "1.1",
				tight: "1.25",
				snug: "1.4",
				normal: "1.6",
				relaxed: "1.65",
				loose: "1.8",
			},

			letterSpacing: {
				tightest: "-0.04em",
				tighter: "-0.03em",
				tight: "-0.02em",
				snug: "-0.01em",
				normal: "0em",
				wide: "0.03em",
				wider: "0.07em",
				widest: "0.1em",
				label: "0.1em",   // dùng cho uppercase label
			},

			// ───────────────────────────────────────────────────────
			// SPACING — base unit = 4px
			// ───────────────────────────────────────────────────────
			spacing: {
				px: "1px",
				0: "0px",
				0.5: "2px",
				1: "4px",
				1.5: "6px",
				2: "8px",
				2.5: "10px",
				3: "12px",
				3.5: "14px",
				4: "16px",
				5: "20px",
				6: "24px",
				7: "28px",
				8: "32px",
				9: "36px",
				10: "40px",
				11: "44px",
				12: "48px",
				14: "56px",
				16: "64px",
				18: "72px",
				20: "80px",
				24: "96px",
				28: "112px",
				32: "128px",
				// Layout cố định
				"sidebar-w": "208px",
				"topbar-h": "52px",
				"panel-px": "16px",
				"panel-py": "14px",
				"card-gap": "10px",
			},

			// ───────────────────────────────────────────────────────
			// BORDER RADIUS
			// Humanist: ưa góc bo vừa phải — không quá sharp, không pill toàn bộ
			// ───────────────────────────────────────────────────────
			borderRadius: {
				none: "0px",
				xs: "2px",    // chip nhỏ, inline code
				sm: "4px",    // tag, badge khi không dùng pill
				DEFAULT: "8px",    // nút, input, card nhỏ
				md: "8px",
				lg: "10px",   // card, panel
				xl: "14px",   // modal, sheet
				"2xl": "20px",   // container lớn
				"3xl": "28px",
				full: "9999px", // pill / avatar
			},

			// ───────────────────────────────────────────────────────
			// BOX SHADOW — flat + functional, không decorative
			// Quy tắc: không dùng drop-shadow màu, chỉ black/alpha
			// ───────────────────────────────────────────────────────
			boxShadow: {
				none: "none",
				xs: "0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
				sm: "0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
				md: "0 4px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)",
				lg: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)",
				xl: "0 16px 40px rgba(0,0,0,0.14), 0 4px 10px rgba(0,0,0,0.07)",
				// focus ring — dùng cho input focus, không phải glow
				"focus-blue": "0 0 0 3px rgba(30,79,168,0.18)",
				"focus-warm": "0 0 0 3px rgba(194,113,79,0.18)",
				"focus-red": "0 0 0 3px rgba(153,27,27,0.15)",
				// dark equivalents
				"dark-xs": "0 1px 2px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04)",
				"dark-sm": "0 1px 4px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04)",
				"dark-md": "0 4px 12px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.30)",
				"dark-lg": "0 8px 24px rgba(0,0,0,0.65), 0 2px 6px rgba(0,0,0,0.35)",
			},

			// ───────────────────────────────────────────────────────
			// TRANSITION
			// ───────────────────────────────────────────────────────
			transitionDuration: {
				75: "75ms",
				100: "100ms",
				fast: "120ms",
				base: "200ms",
				slow: "300ms",
				lazy: "400ms",
			},

			transitionTimingFunction: {
				smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
				bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
				"in": "cubic-bezier(0.4, 0, 1, 1)",
				"out": "cubic-bezier(0, 0, 0.2, 1)",
			},

			// ───────────────────────────────────────────────────────
			// Z-INDEX — thứ tự layer rõ ràng, không conflict
			// ───────────────────────────────────────────────────────
			zIndex: {
				base: "0",
				raised: "10",
				dropdown: "200",
				sticky: "300",
				overlay: "400",
				modal: "500",
				toast: "600",
				tooltip: "700",
			},

			// ───────────────────────────────────────────────────────
			// ANIMATIONS
			// ───────────────────────────────────────────────────────
			keyframes: {
				"fade-up": {
					from: { opacity: "0", transform: "translateY(8px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				"fade-in": {
					from: { opacity: "0" },
					to: { opacity: "1" },
				},
				"scale-in": {
					from: { opacity: "0", transform: "scale(0.96)" },
					to: { opacity: "1", transform: "scale(1)" },
				},
				"slide-right": {
					from: { opacity: "0", transform: "translateX(-12px)" },
					to: { opacity: "1", transform: "translateX(0)" },
				},
				"shimmer": {
					from: { backgroundPosition: "-200% 0" },
					to: { backgroundPosition: "200% 0" },
				},
				"pulse-dot": {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0.35" },
				},
			},

			animation: {
				"fade-up": "fade-up 0.2s cubic-bezier(0.4,0,0.2,1) forwards",
				"fade-in": "fade-in 0.15s ease forwards",
				"scale-in": "scale-in 0.15s cubic-bezier(0.34,1.56,0.64,1) forwards",
				"slide-right": "slide-right 0.2s ease forwards",
				"shimmer": "shimmer 1.8s linear infinite",
				"pulse-dot": "pulse-dot 2s ease-in-out infinite",
			},

			// ───────────────────────────────────────────────────────
			// BACKGROUND IMAGE
			// ───────────────────────────────────────────────────────
			backgroundImage: {
				"shimmer-light":
					"linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
				"shimmer-dark":
					"linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
			},
		},
	},

	// ─────────────────────────────────────────────────────────
	// PLUGINS
	// ─────────────────────────────────────────────────────────
	plugins: [
		function ({ addBase, addComponents, addUtilities, theme }) {

			// ── Base resets ──────────────────────────────────────
			addBase({
				"*, *::before, *::after": { boxSizing: "border-box" },
				"html": { scrollBehavior: "smooth" },
				"::selection": {
					background: theme("colors.ink-blue.fill"),
					color: theme("colors.ink-blue.text"),
				},
				":focus-visible": {
					outline: `2px solid ${theme("colors.ink-blue.text")}`,
					outlineOffset: "2px",
					borderRadius: theme("borderRadius.xs"),
				},
				"::-webkit-scrollbar": { width: "5px", height: "5px" },
				"::-webkit-scrollbar-track": { background: theme("colors.surface.2") },
				"::-webkit-scrollbar-thumb": {
					background: theme("colors.ink.4"),
					borderRadius: theme("borderRadius.full"),
				},
			});

			// ── Component classes ─────────────────────────────────
			addComponents({

				// BUTTON BASE
				".btn": {
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					gap: "6px",
					fontFamily: `var(--font-sans)`,
					fontSize: theme("fontSize.base[0]"),
					fontWeight: theme("fontWeight.medium"),
					letterSpacing: "0.01em",
					lineHeight: "1",
					padding: "8px 16px",
					borderRadius: theme("borderRadius.DEFAULT"),
					border: "1px solid transparent",
					cursor: "pointer",
					transition: "all 120ms ease",
					userSelect: "none",
					whiteSpace: "nowrap",
				},

				".btn-primary": {
					background: theme("colors.ink-blue.text"),
					color: "#fff",
					borderColor: theme("colors.ink-blue.text"),
					"&:hover": { opacity: "0.88" },
					"&:active": { transform: "scale(0.98)" },
				},
				".btn-secondary": {
					background: theme("colors.surface.DEFAULT"),
					color: theme("colors.ink.1"),
					borderColor: "rgba(0,0,0,0.08)",
					"&:hover": { background: theme("colors.surface.2") },
					"&:active": { transform: "scale(0.98)" },
				},
				".btn-ghost": {
					background: "transparent",
					color: theme("colors.ink.2"),
					"&:hover": { background: theme("colors.surface.3"), color: theme("colors.ink.1") },
					"&:active": { transform: "scale(0.98)" },
				},
				".btn-warm": {
					background: theme("colors.warm.400"),
					color: "#fff",
					borderColor: theme("colors.warm.400"),
					"&:hover": { background: theme("colors.warm.600") },
					"&:active": { transform: "scale(0.98)" },
				},
				".btn-danger": {
					background: theme("colors.ink-red.fill"),
					color: theme("colors.ink-red.text"),
					borderColor: theme("colors.ink-red.border"),
					"&:hover": { opacity: "0.85" },
					"&:active": { transform: "scale(0.98)" },
				},
				".btn-sm": { padding: "5px 12px", fontSize: theme("fontSize.xs[0]"), borderRadius: theme("borderRadius.sm") },
				".btn-lg": { padding: "11px 22px", fontSize: theme("fontSize.lg[0]"), borderRadius: theme("borderRadius.lg") },
				".btn-icon": { padding: "8px" },

				// PILL / BADGE
				".pill": {
					display: "inline-flex",
					alignItems: "center",
					gap: "4px",
					padding: "3px 9px",
					borderRadius: theme("borderRadius.full"),
					fontSize: theme("fontSize.xs[0]"),
					fontWeight: theme("fontWeight.semibold"),
					letterSpacing: theme("letterSpacing.wide"),
					fontFamily: `var(--font-sans)`,
					border: "1px solid transparent",
				},
				".pill-dot": {
					width: "5px",
					height: "5px",
					borderRadius: theme("borderRadius.full"),
					background: "currentColor",
					flexShrink: "0",
				},
				".pill-blue": { background: theme("colors.ink-blue.fill"), color: theme("colors.ink-blue.text"), borderColor: theme("colors.ink-blue.border") },
				".pill-green": { background: theme("colors.ink-green.fill"), color: theme("colors.ink-green.text"), borderColor: theme("colors.ink-green.border") },
				".pill-amber": { background: theme("colors.ink-amber.fill"), color: theme("colors.ink-amber.text"), borderColor: theme("colors.ink-amber.border") },
				".pill-red": { background: theme("colors.ink-red.fill"), color: theme("colors.ink-red.text"), borderColor: theme("colors.ink-red.border") },
				".pill-sage": { background: theme("colors.ink-sage.fill"), color: theme("colors.ink-sage.text"), borderColor: theme("colors.ink-sage.border") },
				".pill-warm": { background: theme("colors.warm.fill"), color: theme("colors.warm.text"), borderColor: theme("colors.warm.border") },

				// INPUT
				".input-field": {
					display: "flex",
					alignItems: "center",
					gap: "8px",
					background: theme("colors.surface.DEFAULT"),
					border: `1px solid rgba(0,0,0,0.13)`,
					borderRadius: theme("borderRadius.DEFAULT"),
					padding: "0 12px",
					transition: "border 120ms ease, box-shadow 120ms ease",
					"&:focus-within": {
						borderColor: theme("colors.ink-blue.text"),
						boxShadow: theme("boxShadow.focus-blue"),
					},
				},
				".input-field input, .input-field textarea, .input-field select": {
					flex: "1",
					border: "none",
					outline: "none",
					background: "transparent",
					fontFamily: `var(--font-sans)`,
					fontSize: theme("fontSize.base[0]"),
					color: theme("colors.ink.1"),
					padding: "9px 0",
					"&::placeholder": { color: theme("colors.ink.4") },
				},
				".input-error .input-field": {
					borderColor: theme("colors.ink-red.text"),
					"&:focus-within": { boxShadow: theme("boxShadow.focus-red") },
				},
				".input-label": {
					fontSize: theme("fontSize.2xs[0]"),
					fontWeight: theme("fontWeight.semibold"),
					letterSpacing: theme("letterSpacing.label"),
					textTransform: "uppercase",
					color: theme("colors.ink.3"),
				},
				".input-helper": { fontSize: theme("fontSize.xs[0]"), color: theme("colors.ink.3") },
				".input-error-msg": { fontSize: theme("fontSize.xs[0]"), color: theme("colors.ink-red.text") },

				// STAT CARD — Editorial Humanist
				// KHÔNG dùng border-left màu — dùng số serif lớn + whitespace thay thế
				".stat-card": {
					background: theme("colors.surface.DEFAULT"),
					border: "1px solid rgba(0,0,0,0.08)",
					borderRadius: theme("borderRadius.lg"),
					padding: "16px 16px 14px",
				},
				".stat-label": {
					fontSize: theme("fontSize.2xs[0]"),
					fontWeight: theme("fontWeight.semibold"),
					letterSpacing: theme("letterSpacing.label"),
					textTransform: "uppercase",
					color: theme("colors.ink.3"),
					marginBottom: "10px",
				},
				".stat-value": {
					fontFamily: `var(--font-serif)`,
					fontSize: "28px",
					fontWeight: theme("fontWeight.semibold"),
					color: theme("colors.ink.1"),
					letterSpacing: theme("letterSpacing.tightest"),
					lineHeight: "1",
					marginBottom: "8px",
				},
				".stat-unit": {
					fontSize: "14px",
					opacity: "0.45",
					fontFamily: `var(--font-sans)`,
					fontWeight: theme("fontWeight.regular"),
				},

				// CARD / PANEL
				".card": {
					background: theme("colors.surface.DEFAULT"),
					border: "1px solid rgba(0,0,0,0.08)",
					borderRadius: theme("borderRadius.lg"),
					overflow: "hidden",
				},
				".card-header": {
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					padding: "14px 16px 12px",
					borderBottom: "1px solid rgba(0,0,0,0.08)",
				},
				".card-title": {
					fontFamily: `var(--font-serif)`,
					fontSize: theme("fontSize.base[0]"),
					fontWeight: theme("fontWeight.semibold"),
					color: theme("colors.ink.1"),
					letterSpacing: theme("letterSpacing.tight"),
				},
				".card-subtitle": {
					fontSize: theme("fontSize.xs[0]"),
					color: theme("colors.ink.3"),
					marginTop: "2px",
				},
				".card-body": { padding: "16px" },
				".card-footer": {
					display: "flex",
					alignItems: "center",
					justifyContent: "flex-end",
					gap: "8px",
					padding: "12px 16px",
					borderTop: "1px solid rgba(0,0,0,0.08)",
					background: theme("colors.surface.2"),
				},

				// DATA TABLE
				".data-table": { width: "100%", borderCollapse: "collapse" },
				".data-table thead th": {
					fontSize: theme("fontSize.2xs[0]"),
					fontWeight: theme("fontWeight.semibold"),
					letterSpacing: theme("letterSpacing.label"),
					textTransform: "uppercase",
					color: theme("colors.ink.3"),
					padding: "9px 16px",
					textAlign: "left",
					background: theme("colors.surface.2"),
					borderBottom: "1px solid rgba(0,0,0,0.08)",
				},
				".data-table tbody tr": {
					borderBottom: "1px solid rgba(0,0,0,0.08)",
					transition: "background 100ms ease",
				},
				".data-table tbody tr:last-child": { borderBottom: "none" },
				".data-table tbody tr:hover td": { background: theme("colors.surface.2") },
				".data-table tbody td": {
					padding: "9px 16px",
					fontSize: theme("fontSize.sm[0]"),
					color: theme("colors.ink.2"),
					verticalAlign: "middle",
				},
				".data-table tbody td:first-child": { color: theme("colors.ink.1"), fontWeight: theme("fontWeight.medium") },

				// SIDEBAR
				".sidebar": {
					width: "208px",
					background: theme("colors.sidebar.bg"),
					display: "flex",
					flexDirection: "column",
					flexShrink: "0",
					borderRight: `1px solid rgba(255,255,255,0.06)`,
				},
				".sidebar-item": {
					display: "flex",
					alignItems: "center",
					gap: "9px",
					padding: "8px 10px",
					borderRadius: theme("borderRadius.DEFAULT"),
					cursor: "pointer",
					color: theme("colors.sidebar.text"),
					fontSize: theme("fontSize.sm[0]"),
					fontWeight: theme("fontWeight.regular"),
					marginBottom: "1px",
					transition: "all 150ms ease",
					"&:hover": { background: "rgba(255,255,255,0.07)", color: "#FAF9F7" },
				},
				".sidebar-item.active": {
					background: "rgba(255,255,255,0.07)",
					color: "#FAF9F7",
					fontWeight: theme("fontWeight.medium"),
				},

				// TOGGLE SWITCH
				".toggle-track": {
					width: "38px",
					height: "20px",
					borderRadius: theme("borderRadius.full"),
					background: theme("colors.ink.4"),
					position: "relative",
					cursor: "pointer",
					flexShrink: "0",
					transition: "background 200ms ease",
					"&.on": { background: theme("colors.ink-blue.text") },
				},
				".toggle-thumb": {
					position: "absolute",
					top: "2px",
					left: "2px",
					width: "16px",
					height: "16px",
					borderRadius: theme("borderRadius.full"),
					background: "#fff",
					boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
					transition: "left 200ms cubic-bezier(0.34,1.56,0.64,1)",
					".on &": { left: "20px" },
				},

				// SKELETON LOADING
				".skeleton": {
					backgroundSize: "200% 100%",
					animation: "shimmer 1.8s linear infinite",
					borderRadius: theme("borderRadius.DEFAULT"),
					backgroundImage:
						"linear-gradient(90deg, #F5F4F1 0%, #EDEBE6 50%, #F5F4F1 100%)",
				},

				// DIVIDER
				".divider": {
					height: "1px",
					background: "rgba(0,0,0,0.08)",
					border: "none",
					margin: "0",
				},

				// EDITORIAL PULL QUOTE (humanist touch)
				".pull-quote": {
					fontFamily: `var(--font-serif)`,
					fontStyle: "italic",
					fontSize: theme("fontSize.md[0]"),
					color: theme("colors.ink.2"),
					lineHeight: theme("lineHeight.relaxed"),
					borderLeft: `2px solid ${theme("colors.warm.400")}`,
					paddingLeft: "16px",
					background: theme("colors.surface.2"),
					borderRadius: "0 8px 8px 0",
					padding: "14px 16px",
				},
			});

			// ── Utility overrides ─────────────────────────────────
			addUtilities({
				// Semantic bg shortcuts (dùng qua CSS var ở dark mode)
				".bg-paper": { background: "var(--bg-paper, #FAFAF8)" },
				".bg-surface": { background: "var(--bg-surface, #FFFFFF)" },
				".bg-surface-2": { background: "var(--bg-surface-2, #F5F4F1)" },
				".bg-surface-3": { background: "var(--bg-surface-3, #EDEBE6)" },

				// Text shortcuts
				".text-ink-1": { color: "var(--ink-1, #1C1917)" },
				".text-ink-2": { color: "var(--ink-2, #57534E)" },
				".text-ink-3": { color: "var(--ink-3, #A8A29E)" },

				// Border shortcut (alpha-based)
				".border-rule": { borderColor: "rgba(0,0,0,0.08)" },
				".border-rule-md": { borderColor: "rgba(0,0,0,0.13)" },

				// Typography utilities
				".text-display": {
					fontFamily: "var(--font-serif, 'Lora', serif)",
					fontWeight: "600",
					letterSpacing: "-0.03em",
					lineHeight: "1.2",
				},
				".text-label": {
					fontSize: "0.6rem",
					fontWeight: "600",
					letterSpacing: "0.1em",
					textTransform: "uppercase",
					color: "var(--ink-3, #A8A29E)",
				},
				".text-mono": {
					fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
					fontSize: "0.75rem",
				},

				// Scrollbar
				".scrollbar-thin": {
					"scrollbar-width": "thin",
					"&::-webkit-scrollbar": { width: "5px", height: "5px" },
					"&::-webkit-scrollbar-thumb": {
						background: "#D6D3D1",
						borderRadius: "9999px",
					},
				},
				".scrollbar-none": {
					"scrollbar-width": "none",
					"&::-webkit-scrollbar": { display: "none" },
				},

				// Transition shortcuts
				".transition-fast": { transition: "all 120ms ease" },
				".transition-base": { transition: "all 200ms ease" },
				".transition-slow": { transition: "all 300ms cubic-bezier(0.4,0,0.2,1)" },

				// Safe area padding (mobile)
				".safe-bottom": { paddingBottom: "env(safe-area-inset-bottom)" },
				".safe-top": { paddingTop: "env(safe-area-inset-top)" },
			});
		},
	],
};