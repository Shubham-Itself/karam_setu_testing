/**
 * KaramSetu: English / Hindi content from contentJson/{lang}/home.json
 */
(function (window) {
	"use strict";

	var STORAGE_KEY = "karamsetu_lang";
	var SUPPORTED = ["en", "hi"];

	function getLang() {
		try {
			var params = new URLSearchParams(window.location.search);
			var q = params.get("lang");
			if (q && SUPPORTED.indexOf(q) !== -1) {
				return q;
			}
		} catch (e) {}
		try {
			var stored = localStorage.getItem(STORAGE_KEY);
			if (stored && SUPPORTED.indexOf(stored) !== -1) {
				return stored;
			}
		} catch (e) {}
		return "en";
	}

	function resolvePath(path, obj) {
		if (!path || obj == null) {
			return undefined;
		}
		var parts = String(path).split(".");
		var cur = obj;
		for (var i = 0; i < parts.length; i++) {
			if (cur == null) {
				return undefined;
			}
			var k = parts[i];
			var n = parseInt(k, 10);
			cur = !isNaN(n) && String(n) === k ? cur[n] : cur[k];
		}
		return cur;
	}

	function setDocumentLang(lang) {
		document.documentElement.lang = lang;
		document.documentElement.classList.toggle("lang-hi", lang === "hi");
		document.documentElement.classList.toggle("lang-en", lang === "en");
		document.body.classList.toggle("lang-hi", lang === "hi");
		document.body.classList.toggle("lang-en", lang === "en");
	}

	function updateLangButtons(lang) {
		document.querySelectorAll("[data-lang]").forEach(function (btn) {
			var l = btn.getAttribute("data-lang");
			var on = l === lang;
			btn.classList.toggle("active", on);
			btn.setAttribute("aria-pressed", on ? "true" : "false");
			if (on) {
				btn.setAttribute("aria-current", "true");
			} else {
				btn.removeAttribute("aria-current");
			}
		});
	}

	function applyHomeContent() {
		var lang = getLang();
		setDocumentLang(lang);
	
		Promise.all([
			fetch("contentJson/" + lang + "/navbar.json"),
			fetch("contentJson/" + lang + "/home.json"),
			fetch("contentJson/" + lang + "/about.json"),
			fetch("contentJson/" + lang + "/driver.json"),
			fetch("contentJson/" + lang + "/collab.json"),
			fetch("contentJson/" + lang + "/framework.json"),
			fetch("contentJson/" + lang + "/faq.json"),
			fetch("contentJson/" + lang + "/footer.json"),
			fetch("contentJson/" + lang + "/contact.json"),




		])
		.then(function (responses) {
			return Promise.all(responses.map(function (r) {
				if (!r.ok) {
					throw new Error("JSON load error " + r.status);
				}
				return r.json();
			}));
		})
		.then(function ([commonData, pageData,aboutData , driverData , collabData , frameData,faqData,footerData , contactData]) {
	
			// 🔥 merge both JSONs
			var data = Object.assign({}, commonData, pageData ,aboutData , driverData , collabData , frameData, faqData ,footerData , contactData);
	
			// ✅ TEXT / HTML
			document.querySelectorAll("[data-i18n]").forEach(function (el) {
				var key = el.getAttribute("data-i18n");
				var val = resolvePath(key, data);
	
				if (val == null || typeof val === "object") return;
	
				var asHtml = el.getAttribute("data-i18n-html") === "true";
				if (asHtml) {
					el.innerHTML = String(val);
				} else {
					el.textContent = String(val);
				}
			});
	
			// ✅ PLACEHOLDER
			document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
				var key = el.getAttribute("data-i18n-placeholder");
				var val = resolvePath(key, data);
	
				if (val == null || typeof val === "object") return;
	
				el.setAttribute("placeholder", String(val));
			});
	
			updateLangButtons(lang);
		})
		.catch(function (err) {
			console.error("[i18n]", err);
		});
	}

	function setLang(lang) {
		if (SUPPORTED.indexOf(lang) === -1) {
			return;
		}
		try {
			localStorage.setItem(STORAGE_KEY, lang);
		} catch (e) {}
		try {
			var u = new URL(window.location.href);
			u.searchParams.set("lang", lang);
			window.history.replaceState({}, "", u);
		} catch (e2) {}
		applyHomeContent();
	}

	function onLangClick(e) {
		var t = e.target.closest("[data-lang]");
		if (!t) {
			return;
		}
		var lang = t.getAttribute("data-lang");
		if (!lang || SUPPORTED.indexOf(lang) === -1) {
			return;
		}
		e.preventDefault();
		setLang(lang);
	}

	function init() {
		setDocumentLang(getLang());
		document.addEventListener("click", onLangClick);
		applyHomeContent();
	}

	window.KaramSetuI18n = {
		getLang: getLang,
		setLang: setLang,
		applyHomeContent: applyHomeContent,
		updateActiveLang: function () {
			updateLangButtons(getLang());
		}
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})(window);
