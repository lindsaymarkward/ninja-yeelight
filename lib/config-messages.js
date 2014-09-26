exports.menu = {
    "contents": [
        { "type": "paragraph", "text": "Ninja Yeelight Driver Configuration."},
        { "type": "input_field_text", "field_name": "bridge_ip_text", "value": "", "label": "Bridge IP Address", "placeholder": "192.168.1.10", "required": true},
        { "type": "submit", "name": "Set IP", "rpc_method": "setIp" },
    ]
};

exports.setIp = {
    "contents": [
        { "type": "paragraph", "text": "Attempted to set bridge IP"},
    ]
};