CREATE TABLE IF NOT EXISTS catalog_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sku VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  location VARCHAR(120) NOT NULL DEFAULT 'Unassigned',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_catalog_items_sku ON catalog_items (sku);
CREATE INDEX IF NOT EXISTS idx_catalog_items_name ON catalog_items (name);
INSERT INTO catalog_items (sku, name, description, quantity, location)
VALUES
  ('NET-1001', 'Enterprise Wi-Fi Router', 'Dual-band network router for small office deployments', 18, 'New Jersey Warehouse'),
  ('NET-1002', 'Managed 24-Port Switch', 'Managed gigabit ethernet switch with VLAN support', 7, 'New Jersey Warehouse'),
  ('HW-2001', 'USB-C Docking Station', 'Multi-display USB-C dock for employee workstations', 42, 'New York Warehouse'),
  ('HW-2002', 'Business Laptop Stand', 'Adjustable aluminum stand for laptop workstations', 4, 'New York Warehouse'),
  ('ACC-3001', 'Wireless Keyboard', 'Compact wireless keyboard with USB receiver', 65, 'New Jersey Warehouse')
ON CONFLICT (sku) DO NOTHING;
