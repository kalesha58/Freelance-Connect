require 'xcodeproj'

project_path = 'freelance.xcodeproj'
project = Xcodeproj::Project.open(project_path)
target_name = 'freelance'
target = project.targets.find { |t| t.name == target_name }

if target.nil?
  puts "Error: Target '#{target_name}' not found."
  exit 1
end

# Check if file is already in the project
file_path = 'freelance/GoogleService-Info.plist'
file_name = 'GoogleService-Info.plist'

# Search in the project for the file
file_ref = project.files.find { |f| f.path == file_path || f.path == file_name || f.display_name == file_name }

if file_ref
  puts "File '#{file_name}' already exists in project."
else
  # Add file reference to the 'freelance' group
  group = project.main_group.find_subpath('freelance', true)
  file_ref = group.new_reference(File.join(Dir.pwd, 'freelance', file_name))
  puts "Added reference for '#{file_name}'."
end

# Check if it's already in the Build Phase (Copy Bundle Resources)
build_phase = target.resources_build_phase
existing_build_file = build_phase.files.find { |f| f.file_ref == file_ref }

if existing_build_file
  puts "File '#{file_name}' is already in the Copy Bundle Resources phase."
else
  # Add to build phase
  build_phase.add_file_reference(file_ref)
  puts "Added '#{file_name}' to Copy Bundle Resources phase."
end

project.save
puts "Successfully linked GoogleService-Info.plist to #{target_name} target."
