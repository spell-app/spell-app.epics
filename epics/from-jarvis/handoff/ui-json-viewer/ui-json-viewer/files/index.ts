/**
 * The JSON viewer family:  defines `<ui-json-viewer>`, and exports its component and DOM element class.
 * - SIDE EFFECT:  importing it defines the tag, and `<ui-icon>` and `<ui-button>` (its toggles' chevrons, its header).
 * - Lives in the Netlists project for now (epic `netlists` P9);  to be folded into `<ui-json>` itself.
 *   `ui-json-viewer.html` is its demo page.
 */

import { DOMJsonViewerElement, UIJsonViewer } from "./UIJsonViewer"

import "spell/ui/components/ui-icon"
import "spell/ui/components/ui-button"

UIJsonViewer.define()

export { DOMJsonViewerElement, UIJsonViewer }
export { JSON_NAVIGATE, type JsonNavigateDetail } from "./UIJsonViewer"
export { jsonViewerVocabulary } from "./UIJsonViewer.en"
