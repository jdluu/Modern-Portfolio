import {
  createSignal,
  createMemo,
  createEffect,
  For,
  Show,
  onCleanup,
  type Accessor,
  type Setter,
} from "solid-js";
import "./FilterDropdown.css";

interface DropdownItem {
  name: string;
  count: number;
}

interface FilterDropdownProps {
  id: string;
  label: string;
  items: Accessor<DropdownItem[]>;
  selectedItems: Accessor<string[]>;
  setSelectedItems: Setter<string[]>;
  placeholder: string;
  onPageReset: () => void;
}

export default function FilterDropdown(props: FilterDropdownProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [searchTerm, setSearchTerm] = createSignal("");
  let dropdownRef: HTMLDivElement | undefined;

  // Close when clicking outside
  createEffect(() => {
    if (typeof document === "undefined") return;
    function onDocClick(e: MouseEvent) {
      if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    onCleanup(() => document.removeEventListener("click", onDocClick));
  });

  // Keyboard navigation for closing
  createEffect(() => {
    if (!isOpen()) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    onCleanup(() => document.removeEventListener("keydown", onKeyDown));
  });

  const visibleItems = () => {
    const term = searchTerm().trim().toLowerCase();
    const all = props.items();
    if (!term) return all;
    return all.filter((it) => it.name.toLowerCase().includes(term));
  };

  const toggleItem = (name: string) => {
    props.setSelectedItems((prev) => {
      const s = new Set(prev);
      if (s.has(name)) s.delete(name);
      else s.add(name);
      return Array.from(s);
    });
    props.onPageReset();
  };

  return (
    <div class="control-pair">
      <label for={props.id} class="control-label">
        {props.label}
      </label>
      <div class="dropdown" ref={(el) => (dropdownRef = el)}>
        <button
          id={props.id}
          class="control-select dropdown-toggle"
          aria-haspopup="true"
          aria-expanded={isOpen()}
          onClick={() => setIsOpen((v) => !v)}
          aria-controls={`${props.id}-panel`}
          type="button"
        >
          {props.selectedItems().length
            ? `${props.selectedItems().length} selected`
            : `All ${props.label.toLowerCase()}`}
        </button>

        <div
          id={`${props.id}-panel`}
          class={`dropdown-panel ${isOpen() ? "open" : ""}`}
          role="menu"
          aria-label={props.label}
        >
          <input
            placeholder={props.placeholder}
            value={searchTerm()}
            onInput={(e) => setSearchTerm(e.currentTarget.value)}
            class="control-select dropdown-search"
          />

          <div class="dropdown-items-scroll">
            <For each={visibleItems()}>
              {(it) => (
                <label class="dropdown-item" role="menuitemcheckbox">
                  <input
                    type="checkbox"
                    checked={props.selectedItems().includes(it.name)}
                    onChange={() => toggleItem(it.name)}
                  />
                  <span>
                    {it.name} ({it.count})
                  </span>
                </label>
              )}
            </For>
            <Show when={visibleItems().length === 0}>
              <div class="dropdown-no-results">No results found</div>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
}
