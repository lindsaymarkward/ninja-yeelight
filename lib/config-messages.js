exports.menu = {
    "contents": [
        { "type": "paragraph", "text": "Ninja Yeelight Driver Configuration."},
        { "type": "submit", "name": "Discover Bridge", "rpc_method": "discover" },
        { "type": "input_field_text", "field_name": "bridge_ip_text", "value": "", "label": "Bridge IP Address", "placeholder": "192.168.1.10", "required": true},
        { "type": "submit", "name": "Set IP", "rpc_method": "setup" },
        { "type": "submit", "name": "Name Lights", "rpc_method": "nameLights" },
        { "type": "close", "text": "Cancel" }
    ]
};

exports.setup = {
    "contents": [
        { "type": "paragraph", "text": "Bridge IP address saved. You can name your lights if you want."},
        { "type": "paragraph", "text": "" },
        { "type": "close", "name": "Close" }
    ]
};

exports.nameLights = {
    "contents": [
        { "type": "paragraph", "text": "Enter light names."}
    ]
};

exports.saveLightNames = {
    "contents": [
        { "type": "paragraph", "text": "Light names saved."},
        { "type": "close", "name": "Close" }
    ]
};

exports.discovered = {
    "contents": [
        { "type": "paragraph", "text": "..."},
        { "type": "input_field_text", "field_name": "bridge_ip_text", "value": "", "label": "Bridge IP Address", "required": true},
        { "type": "submit", "name": "Setup", "rpc_method": "setup" }
    ]
};