import os
import logging
import re
from glob import glob

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def comment_out_relationships_in_file(file_path):
    """
    Comment out all relationship declarations in a model file.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Pattern to match relationship lines
        pattern = r'(\s+)([^#\s].*relationship\s*\([^)]+\).*)'
        
        # Comment out relationship lines
        modified_content = re.sub(pattern, r'\1# \2', content)
        
        # Check if any changes were made
        if content != modified_content:
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(modified_content)
            logger.info(f"Modified: {file_path}")
            return True
        else:
            logger.info(f"No relationships found in: {file_path}")
            return False
    
    except Exception as e:
        logger.error(f"Error processing {file_path}: {str(e)}")
        return False

def fix_all_model_files():
    """
    Find all model files and comment out relationships.
    """
    # Path to models directory
    models_dir = 'app/models'
    
    # Get all Python files in the models directory
    model_files = glob(f'{models_dir}/*.py')
    
    # Exclude __init__.py
    model_files = [f for f in model_files if not f.endswith('__init__.py')]
    
    logger.info(f"Found {len(model_files)} model files to process")
    
    # Process each file
    modified_count = 0
    for file_path in model_files:
        if comment_out_relationships_in_file(file_path):
            modified_count += 1
    
    logger.info(f"Modified {modified_count} files")
    
    # Update __init__.py to only import User
    init_file = f'{models_dir}/__init__.py'
    try:
        with open(init_file, 'w', encoding='utf-8') as file:
            file.write("# Models package\n\n")
            file.write("# Import User model only for authentication\n")
            file.write("from app.models.user import User\n")
        logger.info(f"Updated: {init_file}")
    except Exception as e:
        logger.error(f"Error updating {init_file}: {str(e)}")

if __name__ == "__main__":
    logger.info("Starting model fix process")
    fix_all_model_files()
    logger.info("Model fix process completed") 