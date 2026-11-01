(() => {
  "use strict";

  const initialize = () => {
    const root = document.documentElement;
    const status = document.querySelector("[data-live-status]");
    const announce = (message) => {
      if (status) status.textContent = message;
    };

    // Keep the theme set before paint, including when storage is unavailable.
    const themeToggle = document.getElementById("theme-toggle");
    let theme = root.dataset.theme === "light" ? "light" : "dark";
    try {
      theme =
        localStorage.getItem("ahmet-portfolio-theme") === "light"
          ? "light"
          : "dark";
    } catch (_) {
      // Private browsing can block access to storage.
    }
    const applyTheme = () => {
      root.dataset.theme = theme;
      if (themeToggle) {
        const label = `Switch to ${theme === "dark" ? "light" : "dark"} theme`;
        themeToggle.setAttribute("aria-label", label);
        themeToggle.setAttribute("title", label);
      }
    };
    applyTheme();
    themeToggle?.addEventListener("click", () => {
      theme = theme === "dark" ? "light" : "dark";
      applyTheme();
      try {
        localStorage.setItem("ahmet-portfolio-theme", theme);
      } catch (_) {
        // The selected theme still works for this visit.
      }
    });

    const tablist = document.querySelector('[role="tablist"]');
    const tabs = tablist
      ? Array.from(tablist.querySelectorAll('[role="tab"][data-tab]'))
      : [];
    const aliases = { experience: "work", skills: "about", education: "about" };
    const tabForHash = (hash) => {
      let name;
      try {
        name = decodeURIComponent(hash.replace(/^#/, "")).toLowerCase();
      } catch (_) {
        return null;
      }
      name = aliases[name] || name;
      return tabs.find((tab) => tab.dataset.tab === name) || null;
    };
    const activateTab = (
      activeTab,
      { focus = false, updateHash = true } = {},
    ) => {
      if (!activeTab) return;
      tabs.forEach((tab) => {
        const active = tab === activeTab;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        const panel = document.getElementById(
          tab.getAttribute("aria-controls"),
        );
        if (panel) panel.hidden = !active;
      });
      if (updateHash && window.location.hash !== `#${activeTab.dataset.tab}`) {
        try {
          window.history.replaceState(
            window.history.state,
            "",
            `#${activeTab.dataset.tab}`,
          );
        } catch (_) {
          // Tabs remain usable in file previews that restrict history updates.
        }
      }
      if (focus) activeTab.focus({ preventScroll: true });
    };
    const initialTab = tabForHash(window.location.hash);
    activateTab(
      initialTab || tabs.find((tab) => tab.dataset.tab === "work") || tabs[0],
      {
        updateHash: Boolean(initialTab),
      },
    );
    tabs.forEach((tab) =>
      tab.addEventListener("click", () => activateTab(tab)),
    );
    tablist?.addEventListener("keydown", (event) => {
      const index = tabs.indexOf(event.target.closest('[role="tab"]'));
      if (index < 0) return;
      let nextIndex;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft")
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      activateTab(tabs[nextIndex], { focus: true });
    });
    window.addEventListener("hashchange", () => {
      const tab = tabForHash(window.location.hash);
      if (tab) activateTab(tab);
      else if (!window.location.hash)
        activateTab(tabs[0], { updateHash: false });
    });
    document.querySelectorAll("a[data-tab-link]").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        const href = link.getAttribute("href");
        if (
          !href?.startsWith("#") ||
          link.hasAttribute("download") ||
          link.target === "_blank"
        )
          return;
        const tab = tabForHash(href);
        if (!tab) return;
        event.preventDefault();
        activateTab(tab, { focus: true });
        if (
          tablist &&
          link.closest("[data-tilt], [data-profile], .profile-card, .profile")
        ) {
          tablist.scrollIntoView({ block: "nearest", behavior: "auto" });
        }
      });
    });

    const filterButtons = Array.from(
      document.querySelectorAll("[data-project-filter]"),
    );
    const projectCards = Array.from(
      document.querySelectorAll("[data-project-card]"),
    );
    const filterName = (button) =>
      button.dataset.projectFilter || button.dataset.category || "all";
    const filterProjects = (category) => {
      let visibleCount = 0;
      projectCards.forEach((card) => {
        const categories = (card.dataset.category || "").split(/\s+/);
        card.hidden = category !== "all" && !categories.includes(category);
        if (!card.hidden) visibleCount += 1;
      });
      filterButtons.forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(filterName(button) === category),
        ),
      );
      document.querySelectorAll("[data-project-count]").forEach((count) => {
        count.textContent = String(visibleCount);
      });
    };
    filterButtons.forEach((button) =>
      button.addEventListener("click", () =>
        filterProjects(filterName(button)),
      ),
    );
    if (filterButtons.length) {
      const initialFilter = filterButtons.find(
        (button) => button.getAttribute("aria-pressed") === "true",
      );
      filterProjects(initialFilter ? filterName(initialFilter) : "all");
    }

    const copyTimers = new Set();
    const resetCopyLabels = [];
    document.querySelectorAll("[data-copy-email]").forEach((button) => {
      const label = button.querySelector("[data-copy-label]");
      const originalLabel = label?.textContent || "Copy email";
      let resetTimer;
      let fallback;
      let copying = false;
      resetCopyLabels.push(() => {
        if (label) label.textContent = originalLabel;
      });
      button.addEventListener("click", async () => {
        const email = button.dataset.email;
        if (!email || copying) return;
        copying = true;
        if (resetTimer) {
          window.clearTimeout(resetTimer);
          copyTimers.delete(resetTimer);
        }
        try {
          if (!window.isSecureContext || !navigator.clipboard?.writeText)
            throw new Error("Clipboard unavailable");
          await navigator.clipboard.writeText(email);
          if (label) label.textContent = "Copied!";
          if (fallback) fallback.hidden = true;
          announce("Email address copied.");
        } catch (_) {
          if (label) label.textContent = "Copy unavailable";
          const emailLink = Array.from(
            document.querySelectorAll('a[href^="mailto:"]'),
          ).find((link) => {
            return (
              link.getAttribute("href").slice(7).split("?")[0] === email &&
              link.textContent.includes(email) &&
              link.getClientRects().length > 0
            );
          });
          let selectionTarget = emailLink;
          if (!selectionTarget) {
            if (!fallback) {
              fallback = document.createElement("span");
              fallback.className = "copy-fallback";
              fallback.textContent = email;
              button.insertAdjacentElement("afterend", fallback);
            }
            fallback.hidden = false;
            selectionTarget = fallback;
          }
          const selection = window.getSelection();
          if (selection) {
            const range = document.createRange();
            range.selectNodeContents(selectionTarget);
            selection.removeAllRanges();
            selection.addRange(range);
          }
          announce(`Copy unavailable. Email: ${email}`);
        } finally {
          copying = false;
          resetTimer = window.setTimeout(() => {
            if (label) label.textContent = originalLabel;
            copyTimers.delete(resetTimer);
            resetTimer = undefined;
          }, 2000);
          copyTimers.add(resetTimer);
        }
      });
    });

    const form = document.getElementById("contact-form");
    const result = document.getElementById("contact-result");
    const sendMessage = document.getElementById("send-message");
    if (form && result && sendMessage) {
      const nameField = form.elements.namedItem("name");
      const emailField = form.elements.namedItem("email");
      const messageField = form.elements.namedItem("message");
      [nameField, emailField, messageField].forEach((field) => {
        field?.addEventListener("input", () => field.setCustomValidity(""));
      });
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!nameField || !emailField || !messageField) return;
        [nameField, emailField, messageField].forEach((field) => {
          field.value = field.value.trim();
          field.setCustomValidity("");
        });
        if (!nameField.value)
          nameField.setCustomValidity("Please enter your name.");
        if (messageField.value.length < 15)
          messageField.setCustomValidity(
            "Please enter a message with at least 15 characters.",
          );
        if (!form.reportValidity()) return;
        const subject = `Portfolio inquiry - ${nameField.value}`;
        const body = `Name: ${nameField.value}\nEmail: ${emailField.value}\n\n${messageField.value}`;
        sendMessage.href = `mailto:ahmedamanov97@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        sendMessage.textContent = "Open email app";
        form.hidden = true;
        result.hidden = false;
        result.setAttribute("tabindex", "-1");
        result.focus({ preventScroll: true });
      });
      document
        .getElementById("edit-message")
        ?.addEventListener("click", (event) => {
          event.preventDefault();
          result.hidden = true;
          form.hidden = false;
          messageField?.focus({ preventScroll: true });
        });
      // Only reveal the form after its safe email-draft submission handler exists.
      form.hidden = false;
    }

    if (typeof window.matchMedia === "function") {
      const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
      const motion = window.matchMedia(
        "(prefers-reduced-motion: no-preference)",
      );
      document.querySelectorAll("[data-tilt]").forEach((card) => {
        let frame = 0;
        let position;
        const reset = () => {
          window.cancelAnimationFrame(frame);
          frame = 0;
          card.style.removeProperty("--tilt-x");
          card.style.removeProperty("--tilt-y");
        };
        card.addEventListener(
          "pointermove",
          (event) => {
            if (
              !pointer.matches ||
              !motion.matches ||
              event.pointerType === "touch"
            )
              return;
            position = { x: event.clientX, y: event.clientY };
            if (frame) return;
            frame = window.requestAnimationFrame(() => {
              frame = 0;
              const bounds = card.getBoundingClientRect();
              if (!bounds.width || !bounds.height) return;
              const x = Math.max(
                -1,
                Math.min(
                  1,
                  ((position.x - bounds.left) / bounds.width) * 2 - 1,
                ),
              );
              const y = Math.max(
                -1,
                Math.min(
                  1,
                  ((position.y - bounds.top) / bounds.height) * 2 - 1,
                ),
              );
              card.style.setProperty("--tilt-x", `${(-y * 2).toFixed(2)}deg`);
              card.style.setProperty("--tilt-y", `${(x * 2).toFixed(2)}deg`);
            });
          },
          { passive: true },
        );
        card.addEventListener("pointerleave", reset);
        card.addEventListener("pointercancel", reset);
        [pointer, motion].forEach((query) => {
          if (query.addEventListener) query.addEventListener("change", reset);
          else query.addListener(reset);
        });
        window.addEventListener("pagehide", reset);
      });
    }

    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
    const houstonTime = document.getElementById("houston-time");
    let clockInterval;
    if (houstonTime) {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Chicago",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const updateTime = () => {
        const now = new Date();
        houstonTime.textContent = formatter.format(now);
        if (houstonTime.tagName === "TIME")
          houstonTime.dateTime = now.toISOString();
      };
      const startClock = () => {
        updateTime();
        if (clockInterval) window.clearInterval(clockInterval);
        clockInterval = window.setInterval(updateTime, 60000);
      };
      startClock();
      window.addEventListener("pageshow", (event) => {
        if (event.persisted) startClock();
      });
    }
    window.addEventListener("pagehide", () => {
      if (clockInterval) window.clearInterval(clockInterval);
      copyTimers.forEach((timer) => window.clearTimeout(timer));
      copyTimers.clear();
      resetCopyLabels.forEach((reset) => reset());
    });
  };

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
