<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DestinationResource\Pages;
use App\Models\Destination;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Forms\Set;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class DestinationResource extends Resource
{
    protected static ?string $model = Destination::class;

    protected static ?string $navigationIcon = 'heroicon-o-map';

    protected static ?string $navigationGroup = 'Content';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Basics')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('name')
                                    ->required()
                                    ->maxLength(255)
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(static fn (Set $set, ?string $state) => $set('slug', Str::slug((string) $state))),
                                TextInput::make('slug')
                                    ->required()
                                    ->maxLength(255)
                                    ->unique(ignoreRecord: true),
                            ]),
                        Grid::make(3)
                            ->schema([
                                Select::make('type')
                                    ->options([
                                        'country' => 'Country',
                                        'city' => 'City',
                                        'region' => 'Region',
                                    ])
                                    ->default('city')
                                    ->required(),
                                TextInput::make('country_code')
                                    ->maxLength(3)
                                    ->label('Country Code')
                                    ->placeholder('e.g. IN'),
                                TextInput::make('state')
                                    ->maxLength(255)
                                    ->label('State / Province'),
                            ]),
                        Grid::make(2)
                            ->schema([
                                TextInput::make('lat')
                                    ->numeric()
                                    ->step(0.000001)
                                    ->label('Latitude'),
                                TextInput::make('lng')
                                    ->numeric()
                                    ->step(0.000001)
                                    ->label('Longitude'),
                            ]),
                        FileUpload::make('hero_image')
                            ->disk('public')
                            ->directory('destinations/hero')
                            ->image()
                            ->maxSize(4096)
                            ->imageEditor(),
                        RichEditor::make('summary')
                            ->columnSpanFull(),
                    ]),
                Section::make('SEO & Social')
                    ->collapsible()
                    ->collapsed()
                    ->schema([
                        TextInput::make('seo_title')->maxLength(255),
                        Textarea::make('seo_description')->rows(3)->columnSpanFull(),
                        FileUpload::make('og_image')
                            ->disk('public')
                            ->directory('destinations/og')
                            ->image()
                            ->maxSize(4096),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Stack::make([
                    ImageColumn::make('hero_image')
                        ->disk('public')
                        ->square()
                        ->size(48)
                        ->label('Hero'),
                    ImageColumn::make('og_image')
                        ->disk('public')
                        ->square()
                        ->size(48)
                        ->label('OG')
                        ->toggleable(isToggledHiddenByDefault: true),
                ])->space(3),
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('type')
                    ->badge()
                    ->sortable(),
                TextColumn::make('country_code')
                    ->label('Country')
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('updated_at')
                    ->since()
                    ->label('Updated')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('type')
                    ->options([
                        'country' => 'Country',
                        'city' => 'City',
                        'region' => 'Region',
                    ]),
                SelectFilter::make('country_code')
                    ->label('Country Code')
                    ->options(
                        fn () => Destination::query()
                            ->whereNotNull('country_code')
                            ->distinct()
                            ->orderBy('country_code')
                            ->pluck('country_code', 'country_code')
                            ->toArray()
                    ),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'slug'];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDestinations::route('/'),
            'create' => Pages\CreateDestination::route('/create'),
            'edit' => Pages\EditDestination::route('/{record}/edit'),
        ];
    }
}
