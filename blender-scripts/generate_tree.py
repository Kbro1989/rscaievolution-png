"""
Blender Python Script: Generate Procedural Tree
Usage: blender --background --python generate_tree.py -- --type oak --complexity 5 --seed 42 --output tree.glb
"""

import bpy
import sys
import random
import argparse
from math import pi

def cleanup_scene():
    """Remove all objects from the scene"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

def generate_tree(tree_type, complexity, seed, output_path):
    """Generate a procedural tree using Blender"""
    
    # Set random seed
    random.seed(seed)
    
    # Tree parameters based on type
    tree_params = {
        'oak': {
            'trunk_height': 2.5,
            'trunk_radius': 0.3,
            'crown_size': 2.0,
            'branch_count': 8,
            'leaf_density': 0.8,
        },
        'willow': {
            'trunk_height': 3.0,
            'trunk_radius': 0.25,
            'crown_size': 2.5,
            'branch_count': 12,
            'leaf_density': 1.0,
        },
        'yew': {
            'trunk_height': 4.0,
            'trunk_radius': 0.4,
            'crown_size': 1.5,
            'branch_count': 6,
            'leaf_density': 0.6,
        },
        'maple': {
            'trunk_height': 3.5,
            'trunk_radius': 0.35,
            'crown_size': 2.2,
            'branch_count': 10,
            'leaf_density': 0.7,
        },
    }
    
    params = tree_params.get(tree_type, tree_params['oak'])
    
    # Create trunk (cylinder)
    bpy.ops.mesh.primitive_cylinder_add(
        radius=params['trunk_radius'],
        depth=params['trunk_height'],
        location=(0, 0, params['trunk_height'] / 2)
    )
    trunk = bpy.context.active_object
    trunk.name = 'Trunk'
    
    # Add material to trunk (brown)
    mat_trunk = bpy.data.materials.new(name="Bark")
    mat_trunk.use_nodes = True
    bsdf = mat_trunk.node_tree.nodes["Principled BSDF"]
    bsdf.inputs['Base Color'].default_value = (0.3, 0.2, 0.1, 1.0)
    trunk.data.materials.append(mat_trunk)
    
    # Create crown (ico sphere for simplicity, can use particles for leaves)
    bpy.ops.mesh.primitive_ico_sphere_add(
        subdivisions=2,
        radius=params['crown_size'],
        location=(0, 0, params['trunk_height'] + params['crown_size'] * 0.5)
    )
    crown = bpy.context.active_object
    crown.name = 'Crown'
    
    # Add material to crown (green)
    mat_crown = bpy.data.materials.new(name="Leaves")
    mat_crown.use_nodes = True
    bsdf_crown = mat_crown.node_tree.nodes["Principled BSDF"]
    bsdf_crown.inputs['Base Color'].default_value = (0.2, 0.6, 0.2, 1.0)
    crown.data.materials.append(mat_crown)
    
    # Join trunk and crown
    bpy.ops.object.select_all(action='DESELECT')
    trunk.select_set(True)
    crown.select_set(True)
    bpy.context.view_layer.objects.active = trunk
    bpy.ops.object.join()
    
    tree = bpy.context.active_object
    tree.name = f'Tree_{tree_type}'
    
    # Export as GLB
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        use_selection=True
    )
    
    print(f"[Blender] Tree exported to {output_path}")

def main():
    # Parse arguments (everything after --)
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1:]
    else:
        argv = []
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--type', type=str, default='oak')
    parser.add_argument('--complexity', type=int, default=5)
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument('--output', type=str, required=True)
    
    args = parser.parse_args(argv)
    
    print(f"[Blender] Generating tree: type={args.type}, complexity={args.complexity}, seed={args.seed}")
    
    cleanup_scene()
    generate_tree(args.type, args.complexity, args.seed, args.output)

if __name__ == "__main__":
    main()
