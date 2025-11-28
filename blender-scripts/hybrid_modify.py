"""
Blender Python Script: Hybrid Model Modifier
Loads RSMV models and applies modifications
Usage: blender --background --python hybrid_modify.py -- --input model.gltf --output modified.glb --recolor {...}
"""

import bpy
import sys
import json
import argparse
from mathutils import Color

def cleanup_scene():
    """Remove all objects"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

def load_model(input_path):
    """Load GLTF model from RSMV"""
    if input_path == 'none':
        return None
    
    bpy.ops.import_scene.gltf(filepath=input_path)
    return bpy.context.selected_objects

def apply_recolor(objects, recolor_config):
    """Recolor all materials"""
    if not recolor_config or recolor_config.get('from') == 'auto':
        # Auto-detect and shift hue
        hue_shift = recolor_config.get('to', 'hue:0').split(':')[1]
        hue_shift = float(hue_shift) / 360.0
        
        for obj in objects:
            if obj.type == 'MESH' and obj.data.materials:
                for mat in obj.data.materials:
                    if mat.use_nodes:
                        for node in mat.node_tree.nodes:
                            if node.type == 'BSDF_PRINCIPLED':
                                # Shift hue
                                base_color = Color(node.inputs['Base Color'].default_value[:3])
                                base_color.h = (base_color.h + hue_shift) % 1.0
                                node.inputs['Base Color'].default_value = (*base_color, 1.0)
    else:
        # Manual recolor
        from_color = Color(recolor_config.get('from', '#ffffff'))
        to_color = Color(recolor_config.get('to', '#ffffff'))
        
        for obj in objects:
            if obj.type == 'MESH' and obj.data.materials:
                for mat in obj.data.materials:
                    # Replace all instances of from_color with to_color
                    if mat.use_nodes:
                        for node in mat.node_tree.nodes:
                            if node.type == 'BSDF_PRINCIPLED':
                                if node.inputs['Base Color'].default_value[:3] == from_color:
                                    node.inputs['Base Color'].default_value = (*to_color, 1.0)

def apply_rescale(objects, scale):
    """Rescale all objects"""
    for obj in objects:
        obj.scale = (scale, scale, scale)

def main():
    # Parse arguments (everything after --)
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1:]
    else:
        argv = []
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', type=str, default='none')
    parser.add_argument('--output', type=str, required=True)
    parser.add_argument('--recolor', type=str, default='{}')
    parser.add_argument('--rescale', type=float, default=1.0)
    
    args = parser.parse_args(argv)
    
    print(f"[Blender] Hybrid modification: {args.input} → {args.output}")
    
    cleanup_scene()
    
    # Load base model or create procedural
    if args.input != 'none':
        objects = load_model(args.input)
        print(f"[Blender] Loaded {len(objects)} objects from RSMV")
    else:
        # Fallback: Create simple procedural model
        bpy.ops.mesh.primitive_cube_add(size=2)
        objects = [bpy.context.active_object]
        print("[Blender] Created procedural base model")
    
    # Apply modifications
    recolor_config = json.loads(args.recolor)
    if recolor_config:
        apply_recolor(objects, recolor_config)
        print(f"[Blender] Applied recolor")
    
    if args.rescale != 1.0:
        apply_rescale(objects, args.rescale)
        print(f"[Blender] Rescaled to {args.rescale}x")
    
    # Export as GLB
    bpy.ops.export_scene.gltf(
        filepath=args.output,
        export_format='GLB',
        use_selection=False
    )
    
    print(f"[Blender] Exported to {args.output}")

if __name__ == "__main__":
    main()
