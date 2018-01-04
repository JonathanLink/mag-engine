export default function (nodes, types, eventHandler) {
    function handleEvent(e) {
        for (var i = nodes.length; i--;) {
            if (nodes[i].contains(e.target))
                return;
        }
        eventHandler(e);
    }
    for (var i = types.length; i--;) {
        document.addEventListener(types[i], handleEvent);
    }
    return {
        remove: function () {
            for (var i = types.length; i--;) {
                document.removeEventListener(types[i], handleEvent);
            }
        }
    };
}

//# sourceMappingURL=clickOutside.js.map
