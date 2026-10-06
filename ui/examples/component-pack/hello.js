// A component pack's module (`pack.json` beside it):  defines two plain custom elements, not `ui-*`, to show a pack
// may name any tag.  Epic `wwod-spell-ui`, P12.
class HelloCard extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return
    const name = this.getAttribute("name") ?? "there"
    this.attachShadow({ mode: "open" }).innerHTML =
      `<style>:host { display: block; padding: 1em; border: 1px solid; border-radius: 0.5em; max-width: 18em }</style>` +
      `<strong>Hello, ${name}!</strong><p>This element came from a component pack.</p>`
  }
}

class HelloBadge extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return
    this.attachShadow({ mode: "open" }).innerHTML =
      `<style>:host { display: inline-block; padding: 0.2em 0.6em; border-radius: 1em; background: gold }</style><slot></slot>`
  }
}

customElements.define("x-hello-card", HelloCard)
customElements.define("x-hello-badge", HelloBadge)
