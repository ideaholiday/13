<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LeadResource\Pages;
use App\Models\Lead;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Actions\Action;
use Filament\Tables\Columns\SelectColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LeadResource extends Resource
{
    protected static ?string $model = Lead::class;

    protected static ?string $navigationIcon = 'heroicon-o-inbox';

    protected static ?string $navigationGroup = 'CRM';

    public static function form(Form $form): Form
    {
        return $form->schema([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->sortable()
                    ->searchable(),
                TextColumn::make('email')
                    ->label('Email')
                    ->copyable(),
                TextColumn::make('phone')
                    ->label('Phone')
                    ->copyable(),
                TextColumn::make('source')
                    ->badge(),
                TextColumn::make('post.title')
                    ->label('Post')
                    ->formatStateUsing(fn ($state) => $state ?? '—')
                    ->badge()
                    ->color('primary'),
                TextColumn::make('destination.name')
                    ->label('Destination')
                    ->formatStateUsing(fn ($state) => $state ?? '—')
                    ->badge()
                    ->color('info'),
                SelectColumn::make('status')
                    ->options([
                        'new' => 'New',
                        'contacted' => 'Contacted',
                        'qualified' => 'Qualified',
                        'closed' => 'Closed',
                    ])
                    ->label('Status')
                    ->sortable(),
                TextColumn::make('created_at')
                    ->since()
                    ->label('Created'),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'new' => 'New',
                        'contacted' => 'Contacted',
                        'qualified' => 'Qualified',
                        'closed' => 'Closed',
                    ]),
            ])
            ->headerActions([
                Action::make('exportCsv')
                    ->label('Export CSV')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->action(function (): StreamedResponse {
                        $filename = 'leads-export-'.now()->format('Ymd-His').'.csv';

                        return Response::streamDownload(static function () {
                            $handle = fopen('php://output', 'w');
                            fputcsv($handle, ['Name', 'Email', 'Phone', 'Source', 'Status', 'Post', 'Destination', 'Created At']);

                            Lead::query()
                                ->with(['post', 'destination'])
                                ->orderByDesc('created_at')
                                ->chunk(200, static function ($leads) use ($handle) {
                                    foreach ($leads as $lead) {
                                        fputcsv($handle, [
                                            $lead->name,
                                            $lead->email,
                                            $lead->phone,
                                            $lead->source,
                                            $lead->status,
                                            optional($lead->post)->title,
                                            optional($lead->destination)->name,
                                            $lead->created_at,
                                        ]);
                                    }
                                });

                            fclose($handle);
                        }, $filename);
                    })
                    ->color('gray')
                    ->outlined(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canDelete($record): bool
    {
        return false;
    }

    public static function canForceDelete($record): bool
    {
        return false;
    }

    public static function canDeleteAny(): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListLeads::route('/'),
        ];
    }
}
