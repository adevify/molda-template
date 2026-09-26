# React page and bindings

Reusable React components receive presentation data and typed actions through props.
Pages adapt a real fixture and preview bindings into those props. Neither layer knows
the API URL, transport, database entities, or application router.

## Correct

```tsx
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

type RecordSummary = { readonly id: string; readonly label: string };
type PageProps = {
  readonly records: readonly RecordSummary[];
  readonly onSelect: (id: string) => void;
};

function RecordList({ records, onSelect }: PageProps) {
  return (
    <List aria-label="Records">
      {records.map((record) => (
        <ListItem key={record.id} disablePadding>
          <Button onClick={() => onSelect(record.id)}>
            {record.label}
          </Button>
        </ListItem>
      ))}
    </List>
  );
}

// A page module's createProps({ fixture, bindings }) adapts sourced inputs to PageProps.
```

The action is an injected capability. Preview bindings can implement it locally, and a
later application wrapper can provide the production adapter without changing the
presentation. Use the installed component/page contracts and module types where they
already cover the shape.

## Avoid

```tsx
function RecordList() {
  const [records, setRecords] = useState([{ id: "sample", label: "Example record" }]);
  useEffect(() => { fetch("/api/records").then(/* ... */); }, []);
  // ...
}
```

This hard-codes unsupported data and couples a reusable component to network behavior.
Do not add even a plausible-looking sample entity to the preview fixture; populate
fixtures only from accepted project evidence.
