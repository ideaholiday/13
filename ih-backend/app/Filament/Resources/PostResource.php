<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PostResource\Pages;
use App\Filament\Resources\PostResource\RelationManagers\DestinationsRelationManager;
use App\Models\Post;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Forms\Set;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\Layout\Split;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class PostResource extends Resource
{
    protected static ?string $model = Post::class;

    protected static ?string $navigationIcon = 'heroicon-o-newspaper';

    protected static ?string $navigationGroup = 'Content';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Basics')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('title')
                                    ->required()
                                    ->maxLength(255)
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(static fn (Set $set, ?string $state) => $set('slug', Str::slug((string) $state))),
                                TextInput::make('slug')
                                    ->required()
                                    ->maxLength(255)
                                    ->unique(ignoreRecord: true),
                            ]),
                        Textarea::make('excerpt')
                            ->rows(3)
                            ->maxLength(1000),
                        FileUpload::make('cover_image')
                            ->disk('public')
                            ->directory('posts/covers')
                            ->image()
                            ->imageEditor()
                            ->maxSize(4096),
                        TextInput::make('reading_minutes')
                            ->numeric()
                            ->minValue(1)
                            ->helperText('If left empty, the system estimates based on content length.'),
                    ])
                    ->columns(2),
                Section::make('Content')
                    ->schema([
                        RichEditor::make('body')
                            ->required()
                            ->columnSpanFull(),
                    ]),
                Section::make('Taxonomy')
                    ->schema([
                        Select::make('categories')
                            ->label('Categories')
                            ->multiple()
                            ->relationship('categories', 'name')
                            ->searchable()
                            ->preload(),
                        Select::make('tags')
                            ->label('Tags')
                            ->multiple()
                            ->relationship('tags', 'name')
                            ->searchable()
                            ->preload(),
                    ])
                    ->columns(2),
                Section::make('Publish')
                    ->schema([
                        Select::make('status')
                            ->options([
                                'draft' => 'Draft',
                                'published' => 'Published',
                            ])
                            ->default('draft')
                            ->required(),
                        Toggle::make('is_featured')
                            ->inline(false)
                            ->label('Featured'),
                        DateTimePicker::make('publish_at')
                            ->label('Publish At')
                            ->seconds(false)
                            ->native(false),
                        Select::make('author_id')
                            ->relationship('author', 'name')
                            ->searchable()
                            ->label('Author')
                            ->preload(),
                    ])
                    ->columns(2),
                Section::make('SEO & Social')
                    ->collapsible()
                    ->collapsed()
                    ->schema([
                        TextInput::make('seo_title')->maxLength(255),
                        Textarea::make('seo_description')->rows(3),
                        FileUpload::make('og_image')
                            ->disk('public')
                            ->directory('posts/og')
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
                Split::make([
                    ImageColumn::make('cover_image')
                        ->disk('public')
                        ->square()
                        ->size(60)
                        ->label('Cover'),
                    ImageColumn::make('og_image')
                        ->disk('public')
                        ->square()
                        ->size(60)
                        ->label('OG'),
                    TextColumn::make('title')
                        ->searchable()
                        ->sortable()
                        ->limit(40),
                ])->from('md'),
                TextColumn::make('status')
                    ->badge()
                    ->colors([
                        'warning' => 'draft',
                        'success' => 'published',
                    ])
                    ->sortable(),
                IconColumn::make('is_featured')
                    ->boolean()
                    ->label('Featured'),
                TextColumn::make('publish_at')
                    ->dateTime('M d, Y H:i')
                    ->label('Publish At')
                    ->sortable(),
                TextColumn::make('updated_at')
                    ->since()
                    ->label('Updated')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'published' => 'Published',
                    ]),
                TernaryFilter::make('is_featured'),
                SelectFilter::make('categories')
                    ->relationship('categories', 'name'),
                SelectFilter::make('destinations')
                    ->relationship('destinations', 'name')
                    ->label('Destination'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('publish_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [
            DestinationsRelationManager::class,
        ];
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['title', 'slug', 'excerpt'];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with(['categories', 'tags', 'destinations']);
    }

    public static function mutateFormDataBeforeSave(array $data): array
    {
        if (empty($data['reading_minutes']) && !empty($data['body'])) {
            $wordCount = str_word_count(strip_tags((string) $data['body']));
            $data['reading_minutes'] = max(1, (int) ceil($wordCount / 200));
        }

        return $data;
    }

    public static function mutateFormDataBeforeCreate(array $data): array
    {
        return static::mutateFormDataBeforeSave($data);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPosts::route('/'),
            'create' => Pages\CreatePost::route('/create'),
            'edit' => Pages\EditPost::route('/{record}/edit'),
        ];
    }
}
