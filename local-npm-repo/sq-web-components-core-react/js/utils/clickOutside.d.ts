export default function (nodes: Element[], types: string[], eventHandler: (event: Event) => void): {
    remove: () => void;
};
