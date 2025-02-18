# Import required libraries for database connection, data manipulation and visualization
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import json
import sys

# Modified command line argument handling
try:
    if len(sys.argv) < 3:
        print("Usage: python generate_graph.py <country/countries> <graph_type>")
        print("Example: python generate_graph.py Canada,USA annual_co2_emissions")
        print("Example: python generate_graph.py Canada annual_co2_emissions")
        sys.exit(1)

    countries = sys.argv[1]
    graphType = sys.argv[2]

    # Handle different country input formats
    if isinstance(countries, str):
        # Remove any brackets and split by comma
        countries = countries.replace('[', '').replace(']', '').split(',')
        # Clean up any whitespace and quotes
        countries = [country.strip().replace('"', '').replace("'", '') for country in countries]

    # Debug country list
    print("\nCountries to filter:", countries)
    print("Type of countries:", type(countries))
    
    # Read CSV file and print initial data info
    df = pd.read_csv('./environmental_data.csv')
    
    # Debug available countries in the data
    print("\nUnique countries in dataset:", df['Entity'].unique())
    
    # Filter data for selected countries
    df_filtered = df[df['Entity'].isin(countries)]
    
    # More detailed filtering debug info
    print(f"\nFiltering details:")
    print(f"Total rows in original data: {len(df)}")
    print(f"Number of rows after filtering: {len(df_filtered)}")
    print(f"Countries found: {df_filtered['Entity'].unique()}")
    
    if len(df_filtered) == 0:
        raise ValueError(f"No data found for countries: {countries}. Please check country names.")
        
    # Check if filtering worked
    print(f"\nNumber of rows after filtering: {len(df_filtered)}")
    print(f"Countries found: {df_filtered['Entity'].unique()}")
    
    # Verify Year column type and content
    print("\nYear column info:")
    print(f"Year column type: {df_filtered['Year'].dtype}")
    print(f"Year column null values: {df_filtered['Year'].isnull().sum()}")
    
    # Convert Year to numeric if needed
    df_filtered['Year'] = pd.to_numeric(df_filtered['Year'], errors='coerce')
    
    # Get unique years for x-axis ticks
    year_range = sorted(df_filtered['Year'].dropna().unique().astype(int))
    
    if not year_range:
        raise ValueError("No valid years found in the filtered data")
        
    print(f"\nUnique years in data: {year_range}")

    # Dictionary containing graph configurations for different emission types
    graph_values = {
        'annual_co2_emissions': {
            'column': 'Annual CO2 emissions',
            'ylabel': 'Billions Tonnes of CO2',
            'title': 'Annual CO2 Emissions (1950 - 2018)',
        },
        'per_gdp_co2': {
            'column': 'per_gdp_CO2',
            'ylabel': 'Billions Tonnes of CO2 per $ of GDP',
            'title': 'Carbon Emissions intensity of economies (1950 - 2018)'
        },
        'annual_nitrous_oxide_emissions': {
            'column': 'Annual nitrous oxide emissions',  # Fixed case
            'ylabel': 'Billions Tonnes of Nitrous Oxide',
            'title': 'Annual Nitrous Oxide Emissions (1950 - 2018)'
        },
        'annual_methane_emissions': {
            'column': 'Annual methane emissions',  # Fixed case
            'ylabel': 'Billions Tonnes of Methane',
            'title': 'Annual Methane Emissions (1950 - 2018)'
        },
        'per_capita_co2': {
            'column': 'per_capita_CO2',  # Fixed name
            'ylabel': 'Billions Tonnes of CO2 per capita',
            'title': 'Per Capita CO2 Emissions (1950 - 2018)'
        },
        'co2_emmissions_worldtotal': {  # Fixed key name
            'column': 'CO2 emissions %',  # Fixed column name
            'ylabel': 'Percentage of CO2 Emissions',
            'title': 'Annual share of global CO2 emissions (1950 - 2018)'
        },
        'co2_from_greenhouse_emissions': {
            'column': 'CO2 % from greenhouse emissions',  # Fixed column name
            'ylabel': 'Percentage of CO2 from Greenhouse Gas',
            'title': 'Annual CO2 % from Greenhouse Gas Emissions (1950 - 2018)'
        },
        'annual_greenhouse_gas_emissions': {
            'column': 'Annual greenhouse gas emissions',  # Fixed case
            'ylabel': 'Billions Tonnes of CO2 equivalent',
            'title': 'Annual Greenhouse Gas Emissions (1950 - 2018)'
        }
    }

    # Add this before accessing graph_values
    print("\nReceived graph type:", graphType)
    print("Available graph types:", list(graph_values.keys()))

    # Modify the graph configuration lookup with error handling
    try:
        graph_config = graph_values[graphType]
    except KeyError:
        print(f"\nError: '{graphType}' is not a valid graph type.")
        print("Please use one of these graph types:")
        for key in graph_values.keys():
            print(f"  - {key}")
        sys.exit(1)

    column_name = graph_config['column']

    # After filtering data, add these debug statements
    print(f"\nData range for {', '.join(countries)}:")
    print(df_filtered[['Entity', 'Year', column_name]].head())
    print(f"\nYear range: {df_filtered['Year'].min()} to {df_filtered['Year'].max()}")

    # Update the visualization code
    with plt.style.context('Solarize_Light2'):
        fig, ax = plt.subplots(figsize=(12, 6))  # Slightly larger figure
        
        # Create line plot
        sns.lineplot(
            data=df_filtered,
            x='Year',
            y=column_name,
            hue='Entity',
            linewidth=2.5  # Thicker lines for better visibility
        )
        
        # Configure axes
        ax.set_xlabel('Year', fontsize=12)
        ax.set_ylabel(graph_config['ylabel'], fontsize=12)
        ax.set_title(graph_config['title'], fontsize=14, pad=20)
        
        # Set y-axis to start at 0
        ax.set_ylim(bottom=0)
        
        # Set x-axis ticks
        year_min = df_filtered['Year'].min()
        year_max = df_filtered['Year'].max()
        tick_spacing = max(1, (year_max - year_min) // 10)  # About 10 ticks
        
        ax.set_xticks(range(year_min, year_max + 1, tick_spacing))
        ax.tick_params(axis='x', rotation=45)
        
        # Customize legend
        ax.legend(
            title="Countries",
            bbox_to_anchor=(1.05, 1),
            loc='upper left',
            borderaxespad=0
        )
        
        # Add grid for better readability
        ax.grid(True, linestyle='--', alpha=0.7)
        
        # Adjust layout to prevent label cutoff
        plt.tight_layout()
        
        # Save figure
        fig.savefig(
            f'../Database/Pictures/{graphType}.png',
            bbox_inches='tight',
            dpi=300  # Higher resolution
        )

except Exception as e:
    print(f"Error: {str(e)}")
    print(f"Error occurred at line: {sys.exc_info()[2].tb_lineno}")
    sys.exit(1)
