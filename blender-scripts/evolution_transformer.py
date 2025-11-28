"""
Blender Evolution Transformer
Transforms RSMV models through evolution stages (Homo Erectus → Godhood)

Evolution Stages:
  Era 0-1:   Caveman/Homo Erectus - Primitive, rough, stone
  Era 2-3:   Ancient Village - Crude but functional
  Era 4-6:   Bronze → Iron Age - Metallic sheen
  Era 7-9:   Medieval → Renaissance - Polished, detailed
  Era 10-11: Ancient Technology - High-tech, glowing accents, futuristic
  Era 12+:   Deity/Godhood - Bloom, divine glow, hovering, particle effects
"""

import bpy
import sys
import json
import argparse
from mathutils import Vector, Color
import math

def cleanup_scene():
    """Remove all objects"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

def get_era_config(era):
    """
    Get visual transformation config for era
    
    Note: RSC/OSRS/RS3 progression already exists in cache
    This just adds smoothing + divine effects for high eras
    """
    
    # Smoothing levels (subdivision)
    if era <= 3:
        subdiv = 0  # RSC/early - keep blocky
    elif era <= 6:
        subdiv = 1  # OSRS - slight smoothing
    elif era <= 9:
        subdiv = 2  # RS3 - smooth
    elif era <= 11:
        subdiv = 3  # Ancient tech - very smooth
    else:
        subdiv = 4  # Godhood - ultra smooth
    
    # Divine effects only for high eras
    effects = []
    emission = 0.0
    
    if era >= 10:
        effects.append('tech_glow')
        emission = 2.0
    
    if era >= 12:
        effects.extend(['divine_bloom', 'levitation', 'particle_aura', 'divine_rays'])
        emission = 5.0
    
    return {
        'geometry_subdiv': subdiv,
        'emission_strength': emission,
        'effects': effects,
        'roughness': max(0.05, 0.95 - (era * 0.075)),  # Smoother at higher eras
        'metallic': min(0.98, era * 0.08)  # More metallic at higher eras
    }

def apply_evolution_materials(objects, era_config):
    """Apply era-specific materials to objects"""
    for obj in objects:
        if obj.type != 'MESH':
            continue
            
        # Apply to all materials
        if not obj.data.materials:
            # Create default material if none exists
            mat = bpy.data.materials.new(name=f"Era_{era_config['material_type']}")
            obj.data.materials.append(mat)
        
        for mat in obj.data.materials:
            if not mat.use_nodes:
                mat.use_nodes = True
            
            nodes = mat.node_tree.nodes
            links = mat.node_tree.links
            
            # Get or create Principled BSDF
            bsdf = nodes.get("Principled BSDF")
            if not bsdf:
                bsdf = nodes.new("ShaderNodeBsdfPrincipled")
            
            # Apply base color tint
            orig_color = bsdf.inputs['Base Color'].default_value[:3]
            tint = era_config['base_color_tint']
            new_color = tuple(orig_color[i] * tint[i] for i in range(3))
            bsdf.inputs['Base Color'].default_value = (*new_color, 1.0)
            
            # Material properties
            bsdf.inputs['Roughness'].default_value = era_config['roughness']
            bsdf.inputs['Metallic'].default_value = era_config['metallic']
            
            # Emission (glow)
            if era_config['emission_strength'] > 0:
                bsdf.inputs['Emission Strength'].default_value = era_config['emission_strength']
                # Tint emission color
                bsdf.inputs['Emission Color'].default_value = (*new_color, 1.0)

def apply_evolution_geometry(objects, era_config):
    """Apply geometry modifications based on era"""
    subdiv_levels = era_config['geometry_subdiv']
    
    if subdiv_levels > 0:
        for obj in objects:
            if obj.type == 'MESH':
                # Add subdivision modifier for smoother geometry
                subdiv_mod = obj.modifiers.new(name="Evolution_Subdiv", type='SUBSURF')
                subdiv_mod.levels = subdiv_levels
                subdiv_mod.render_levels = subdiv_levels

def apply_evolution_effects(objects, era_config):
    """Apply special effects based on era"""
    effects = era_config['effects']
    
    for effect in effects:
        if effect == 'divine_bloom':
            # Add bloom/glare effect (compositor)
            setup_bloom_compositor(strength=5.0)
        
        elif effect == 'tech_glow' or effect == 'strong_tech_glow':
            # Add edge glow
            strength = 2.0 if effect == 'tech_glow' else 4.0
            add_edge_glow(objects, strength, color=(0.3, 0.7, 1.0))
        
        elif effect == 'levitation':
            # Add floating animation
            add_levitation_animation(objects)
        
        elif effect == 'particle_aura':
            # Add particle system with divine glow
            add_divine_particles(objects)

def setup_bloom_compositor(strength=3.0):
    """Setup bloom effect in compositor"""
    bpy.context.scene.use_nodes = True
    tree = bpy.context.scene.node_tree
    
    # Clear existing nodes
    for node in tree.nodes:
        tree.nodes.remove(node)
    
    # Create nodes
    render_layers = tree.nodes.new('CompositorNodeRLayers')
    glare = tree.nodes.new('CompositorNodeGlare')
    glare.glare_type = 'BLOOM'
    glare.threshold = 0.5
    glare.size = 8
    glare.mix = strength
    
    composite = tree.nodes.new('CompositorNodeComposite')
    
    # Connect
    tree.links.new(render_layers.outputs['Image'], glare.inputs['Image'])
    tree.links.new(glare.outputs['Image'], composite.inputs['Image'])

def add_edge_glow(objects, strength, color):
    """Add glowing edges (tech effect)"""
    for obj in objects:
        if obj.type != 'MESH':
            continue
        
        # Add solidify modifier for edge glow
        solidify = obj.modifiers.new(name="Evolution_Glow", type='SOLIDIFY')
        solidify.thickness = 0.02
        solidify.offset = 1.0
        
        # Create emission material for edges
        glow_mat = bpy.data.materials.new(name="Edge_Glow")
        glow_mat.use_nodes = True
        bsdf = glow_mat.node_tree.nodes["Principled BSDF"]
        bsdf.inputs['Emission Color'].default_value = (*color, 1.0)
        bsdf.inputs['Emission Strength'].default_value = strength
        
        obj.data.materials.append(glow_mat)

def add_levitation_animation(objects):
    """Add gentle floating animation"""
    for obj in objects:
        # Animate Z position
        obj.location.z += 0.5  # Lift slightly
        
        # Add keyframes for bobbing motion
        obj.keyframe_insert(data_path="location", frame=1, index=2)
        obj.location.z += 0.2
        obj.keyframe_insert(data_path="location", frame=60, index=2)
        obj.location.z -= 0.2
        obj.keyframe_insert(data_path="location", frame=120, index=2)
        
        # Make animation loop
        for fcurve in obj.animation_data.action.fcurves:
            for keyframe in fcurve.keyframe_points:
                keyframe.interpolation = 'BEZIER'

def add_divine_particles(objects):
    """Add divine particle aura"""
    for obj in objects:
        if obj.type != 'MESH':
            continue
        
        # Add particle system
        particle_mod = obj.modifiers.new(name="Divine_Aura", type='PARTICLE_SYSTEM')
        psys = obj.particle_systems[-1]
        settings = psys.settings
        
        settings.count = 100
        settings.lifetime = 120
        settings.emit_from = 'FACE'
        settings.normal_factor = 0.5
        settings.factor_random = 0.5
        settings.particle_size = 0.05
        settings.render_type = 'HALO'

def main():
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1:]
    else:
        argv = []
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', type=str, required=True)
    parser.add_argument('--era', type=int, required=True)
    parser.add_argument('--output', type=str, required=True)
    
    args = parser.parse_args(argv)
    
    print(f"[Evolution] Transforming to Era {args.era}")
    
    cleanup_scene()
    
    # Load base model
    bpy.ops.import_scene.gltf(filepath=args.input)
    objects = list(bpy.context.selected_objects)
    
    # Get era configuration
    era_config = get_era_config(args.era)
    print(f"[Evolution] Material type: {era_config['material_type']}")
    
    # Apply evolution transformations
    apply_evolution_materials(objects, era_config)
    apply_evolution_geometry(objects, era_config)
    apply_evolution_effects(objects, era_config)
    
    print(f"[Evolution] Applied era {args.era} transformation")
    
    # Export
    bpy.ops.export_scene.gltf(
        filepath=args.output,
        export_format='GLB',
        use_selection=False
    )
    
    print(f"[Evolution] Exported evolved model to {args.output}")

if __name__ == "__main__":
    main()
