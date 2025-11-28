"""
Blender Python Script: Composite Entity from Multiple Models
Applies Jagex color/material replacements
Usage: blender --background --python composite_entity.py -- --models m1.gltf,m2.gltf --color-replacements [[...]] --output output.glb
"""

import bpy
import sys
import json
import argparse

def cleanup_scene():
    """Remove all objects"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

def load_models(model_paths):
    """Load multiple GLTF models"""
    all_objects = []
    for path in model_paths:
        bpy.ops.import_scene.gltf(filepath=path)
        all_objects.extend(bpy.context.selected_objects)
    return all_objects

def apply_color_replacements(objects, replacements):
    """
    Apply Jagex color replacements
    replacements: [[oldColor, newColor], ...]
    Colors are RS color IDs, need to convert to RGB
    """
    # RS color palette (simplified - full palette has 65536 colors)
    # In production, load full palette from RSMV
    def rs_color_to_rgb(color_id):
        # Simplified conversion - actual RS colors are more complex
        r = ((color_id >> 10) & 0x1F) / 31.0
        g = ((color_id >> 5) & 0x1F) / 31.0
        b = (color_id & 0x1F) / 31.0
        return (r, g, b)
    
    color_map = {}
    for old, new in replacements:
        color_map[rs_color_to_rgb(old)] = rs_color_to_rgb(new)
    
    # Apply replacements
    for obj in objects:
        if obj.type == 'MESH' and obj.data.materials:
            for mat in obj.data.materials:
                if mat.use_nodes:
                    for node in mat.node_tree.nodes:
                        if node.type == 'BSDF_PRINCIPLED':
                            base_color = tuple(node.inputs['Base Color'].default_value[:3])
                            # Check if this color should be replaced
                            for old_color, new_color in color_map.items():
                                # Approximate match (RS colors aren't exact)
                                if all(abs(a - b) < 0.05 for a, b in zip(base_color, old_color)):
                                    node.inputs['Base Color'].default_value = (*new_color, 1.0)
                                    break

def apply_material_replacements(objects, replacements):
    """
    Apply Jagex material replacements
    replacements: [[oldMaterial, newMaterial], ...]
    """
    # Material IDs map to specific textures/properties in RS
    # For now, simplified implementation
    print(f"[Blender] Material replacements: {len(replacements)} (simplified)")
    # TODO: Implement full material replacement logic

def apply_additional_hue_shift(objects, hue_shift):
    """Apply additional hue shift on top of Jagex replacements"""
    if hue_shift == 0:
        return
    
    from mathutils import Color
    hue_offset = hue_shift / 360.0
    
    for obj in objects:
        if obj.type == 'MESH' and obj.data.materials:
            for mat in obj.data.materials:
                if mat.use_nodes:
                    for node in mat.node_tree.nodes:
                        if node.type == 'BSDF_PRINCIPLED':
                            color = Color(node.inputs['Base Color'].default_value[:3])
                            color.h = (color.h + hue_offset) % 1.0
                            node.inputs['Base Color'].default_value = (*color, 1.0)

def apply_rescale(objects, scale):
    """Rescale all objects"""
    for obj in objects:
        obj.scale = (scale, scale, scale)

def main():
    # Parse arguments
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1:]
    else:
        argv = []
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--models', type=str, required=True)
    parser.add_argument('--color-replacements', type=str, default='[]')
    parser.add_argument('--material-replacements', type=str, default='[]')
    parser.add_argument('--additional-hue-shift', type=float, default=0.0)
    parser.add_argument('--rescale', type=float, default=1.0)
    parser.add_argument('--output', type=str, required=True)
    
    args = parser.parse_args(argv)
    
    print(f"[Blender] Compositing entity from {args.models}")
    
    cleanup_scene()
    
    # Load all models
    model_paths = args.models.split(',')
    objects = load_models(model_paths)
    print(f"[Blender] Loaded {len(objects)} objects from {len(model_paths)} models")
    
    # Apply Jagex color replacements
    color_replacements = json.loads(args.color_replacements)
    if color_replacements:
        apply_color_replacements(objects, color_replacements)
        print(f"[Blender] Applied {len(color_replacements)} color replacements")
    
    # Apply Jagex material replacements
    material_replacements = json.loads(args.material_replacements)
    if material_replacements:
        apply_material_replacements(objects, material_replacements)
        print(f"[Blender] Applied {len(material_replacements)} material replacements")
    
    # Apply additional modifications
    if args.additional_hue_shift != 0:
        apply_additional_hue_shift(objects, args.additional_hue_shift)
        print(f"[Blender] Applied additional hue shift: {args.additional_hue_shift}°")
    
    if args.rescale != 1.0:
        apply_rescale(objects, args.rescale)
        print(f"[Blender] Rescaled to {args.rescale}x")
    
    # Join all objects into one
    bpy.ops.object.select_all(action='SELECT')
    bpy.context.view_layer.objects.active = objects[0]
    if len(objects) > 1:
        bpy.ops.object.join()
        print("[Blender] Joined all objects into composite entity")
    
    # Export as GLB
    bpy.ops.export_scene.gltf(
        filepath=args.output,
        export_format='GLB',
        use_selection=True
    )
    
    print(f"[Blender] Exported composite entity to {args.output}")

if __name__ == "__main__":
    main()
