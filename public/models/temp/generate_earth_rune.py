import bpy
import sys

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Create cube
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.5))
cube = bpy.context.object

# Create material
mat = bpy.data.materials.new(name="Material")
mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs['Base Color'].default_value = (0.9, 0.7, 0.6, 1.0)

# Assign material
cube.data.materials.append(mat)

# Export as GLB
bpy.ops.export_scene.gltf(
    filepath="C:\\Users\\Destiny\\Desktop\\ai-architect-mmorpg\\copy-of-rsc-evolution-ai\\public\\models\\earth_rune.glb",
    export_format='GLB',
    use_selection=False
)