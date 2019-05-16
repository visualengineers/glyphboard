from datetime import datetime
from os import path, makedirs
import json

from config import config_manager

class GlyphboardWriter:
    def __init__(self, name):
        target_directory = path.join(
            config_manager.config["glyphboardDataDirectory"],
            name,
        )
        
        if not path.exists(target_directory):
            makedirs(target_directory)
        
        self._filename_prefix = path.join(
            target_directory,
            "{}.{}".format(name, self._timestamp()),
        )

    def write_schema(self, value_labels):
        labels = {
            "1": "id",
            "2": "text",
        }

        for idx, label in enumerate(value_labels.keys(), 3):
            labels[str(idx)] = label

        with open(self._filename_prefix + ".schema.json", "w") as f:
            json.dump({
                "label": labels,
                "glyph": list(map(lambda v: str(v), range(3, len(labels) + 1))),
                "variant-context": {
                    "1": {
                        "id": "1",
                        "description": "standard context"
                    }
                },
                "color": "3",
                "tooltip": list(labels.keys()),
            }, f)

    def write_position(self, positions, algorithm):
        pos = []

        for idx, row in positions.iterrows():
            pos.append({
                "id": int(idx+1),
                "position": {
                    "x": float(row.x),
                    "y": float(row.y),
                    # "x": row[0],
                    # "y": row[1],
                }
            })

        with open("test.position.lsi.json", "w") as f:
            json.dump(pos, f)

    def write_feature(self, meta_data, value_labels):
        feature_sets = []

        for row_idx, row in meta_data.iterrows():
            features = {
                "1": 0,
                "2": 0,
            }

            values = {
                "1": row.id,
                "2": row.text,
            }

            for idx, label in enumerate(value_labels.keys(), 3):
                values[str(idx)] = row[label]
                if row[label] in value_labels[label]:
                    labels = value_labels[label]

                    feature = labels.index(row[label])
                    if label != "Language Detection":
                        feature = feature - 1
                        if feature < 0:
                            feature += 3
                    features[str(idx)] = feature / (len(labels) - 1)
                else:
                    features[str(idx)] = 0

            feature_sets.append({
                "id": int(row_idx + 1),
                "default-context": "1",
                "features": {
                    "1": features,
                },
                "values":  values,
            })

        with open(self._filename_prefix + ".feature.json", "w") as f:
            json.dump(feature_sets, f)

    # ToDo: write real data to this file
    def write_meta(self, value_labels):
        with open(self._filename_prefix + ".meta.json", "w") as f:
            features = { str(idx): {
                "histogram": {
                    "0": 0.0,
                    "1": 1.0,
                },
                "max": 1.0,
                "min": 0.0,
                "median": 0.5,
                "variance": 0.5,
                "deviation": 0.5,
            } for idx in range(3, len(value_labels) + 3) }
            json.dump({
                "features": features
            }, f)

    def _timestamp(self):
        return datetime.now().strftime("%d.%m.%Y")